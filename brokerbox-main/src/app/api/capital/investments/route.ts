import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, rowToApp, appToRow } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import type { TableInsert, TableUpdate } from '@/types/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const amount = Number(body.amount);
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Valid investment amount is required' }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { data: poolRow } = await supabase.from('capital_pool').select('*').eq('id', body.poolId).single();
  if (!poolRow) throw new Error('Pool not found');

  const pool = rowToApp(poolRow as Record<string, unknown>) as {
    totalAmount: number;
    availableAmount: number;
    targetYield: number;
    lenderId: string;
  };

  const invRow = appToRow<Record<string, unknown>>({
    amount,
    yield: Number(body.yield) || pool.targetYield,
    poolId: body.poolId,
    userId: body.userId,
    status: 'active',
  });
  const { data: invData, error: insertErr } = await supabase
    .from('investment')
    .insert(invRow as TableInsert<'investment'>)
    .select()
    .single();
  if (insertErr) throw insertErr;

  const newTotal = pool.totalAmount + amount;
  const newAvailable = pool.availableAmount + amount;
  const newUtilization = (newTotal - newAvailable) / (newTotal || 1) * 100;

  await supabase
    .from('capital_pool')
    .update({
      total_amount: newTotal,
      available_amount: newAvailable,
      utilization_rate: newUtilization,
    } as TableUpdate<'capital_pool'>)
    .eq('id', body.poolId);

  const { data: lenderPools } = await supabase
    .from('capital_pool')
    .select('available_amount')
    .eq('lender_id', pool.lenderId);
  const totalLenderAvailable = (lenderPools ?? []).reduce(
    (sum: number, p: { available_amount: number }) => sum + p.available_amount,
    0
  );
  await supabase.from('lender').update({ capital_available: totalLenderAvailable } as TableUpdate<'lender'>).eq('id', pool.lenderId);

  const inv = rowToApp(invData as Record<string, unknown>);
  await logAudit('Investment', (inv as { id: string }).id, 'CREATE', undefined, { amount });
  return NextResponse.json(inv, { status: 201 });
}
