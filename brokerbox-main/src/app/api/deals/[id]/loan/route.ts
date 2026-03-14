import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, rowToApp, appToRow } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { insertDealStageHistory } from '@/lib/supabase/queries';
import type { TableInsert, TableUpdate } from '@/types/supabase';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const supabase = getAdminClient();
  const { data: dealRow } = await supabase
    .from('deal')
    .select('*, lender(*)')
    .eq('id', id)
    .single();
  if (!dealRow) return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
  const deal = rowToApp(dealRow as Record<string, unknown>) as Record<string, unknown>;

  const { data: existingLoan } = await supabase.from('loan').select('id').eq('deal_id', id).single();
  if (existingLoan) return NextResponse.json({ error: 'Loan already exists' }, { status: 400 });

  const principal = Number(body.principalBalance) || (deal.loanAmount as number);
  const poolId = body.poolId;

  try {
    const loanRow = appToRow<Record<string, unknown>>({
      dealId: id,
      poolId: poolId || null,
      status: 'active',
      fundedDate: body.fundedDate || new Date().toISOString(),
      maturityDate: body.maturityDate,
      principalBalance: principal,
      interestRate: Number(body.interestRate) || (deal.interestRate as number) || 0,
      interestType: body.interestType || 'fixed',
    });
    const { data: newLoanRow, error: loanErr } = await supabase
      .from('loan')
      .insert(loanRow as TableInsert<'loan'>)
      .select()
      .single();
    if (loanErr) throw loanErr;
    const result = rowToApp(newLoanRow as Record<string, unknown>) as { id: string };

    await supabase.from('deal').update({ stage: 'funded' } as TableUpdate<'deal'>).eq('id', id);

    if (poolId) {
      const { data: poolRow } = await supabase.from('capital_pool').select('*').eq('id', poolId).single();
      if (poolRow) {
        const pool = rowToApp(poolRow as Record<string, unknown>) as {
          totalAmount: number;
          availableAmount: number;
          lenderId: string;
        };
        const newAvailable = pool.availableAmount - principal;
        const utilizationRate = pool.totalAmount ? ((pool.totalAmount - newAvailable) / pool.totalAmount) * 100 : 0;
        await supabase
          .from('capital_pool')
          .update({ available_amount: newAvailable, utilization_rate: utilizationRate } as TableUpdate<'capital_pool'>)
          .eq('id', poolId);

        const { data: lenderPools } = await supabase
          .from('capital_pool')
          .select('id, available_amount')
          .eq('lender_id', pool.lenderId);
        const totalLenderAvailable = (lenderPools ?? []).reduce(
          (sum: number, p: { id: string; available_amount: number }) =>
            p.id === poolId ? sum + newAvailable : sum + p.available_amount,
          0
        );
        await supabase.from('lender').update({ capital_available: totalLenderAvailable } as TableUpdate<'lender'>).eq('id', pool.lenderId);
      }
    } else if (deal.lenderId) {
      const { data: lenderRow } = await supabase
        .from('lender')
        .select('capital_available')
        .eq('id', deal.lenderId)
        .single();
      if (lenderRow) {
        const current = (lenderRow as { capital_available: number }).capital_available;
        await supabase
          .from('lender')
          .update({ capital_available: Math.max(0, current - principal) } as TableUpdate<'lender'>)
          .eq('id', deal.lenderId);
      }
    }

    await logAudit('Loan', result.id, 'CREATE', undefined, { transactional: true });
    await logAudit('Deal', id, 'STATUS_CHANGE', {
      stage: { old: deal.stage as string, new: 'funded' },
    });
    await insertDealStageHistory({
      dealId: id,
      fromStage: deal.stage as string,
      toStage: 'funded',
      changedBy: 'broker',
    });

    try {
      const { syncToOutlook } = await import('@/lib/outlook');
      await syncToOutlook('demo');
    } catch (e) {
      console.error('Outlook sync failed:', e);
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const e = err as Error;
    console.error('Funding Transaction Failed:', e);
    return NextResponse.json({ error: e.message || 'Funding failed' }, { status: 500 });
  }
}
