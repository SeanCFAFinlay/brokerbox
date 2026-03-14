export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, rowToApp, rowsToApp, appToRow } from '@/lib/db';
import { runMatch } from '@/lib/domain';
import type { LenderData } from '@/lib/domain/match/types';
import { logAudit } from '@/lib/audit';
import type { TableInsert, TableUpdate } from '@/types/supabase';

export async function POST(req: NextRequest) {
  const { borrowerId, dealId } = await req.json();

  const supabase = getAdminClient();
  const { data: borrowerRow } = await supabase.from('borrower').select('*').eq('id', borrowerId).single();
  if (!borrowerRow) return NextResponse.json({ error: 'Borrower not found' }, { status: 404 });
  const borrower = rowToApp(borrowerRow as Record<string, unknown>) as Record<string, unknown>;

  let dealRow: Record<string, unknown> | null = null;
  if (dealId) {
    const { data } = await supabase.from('deal').select('*').eq('id', dealId).single();
    dealRow = data;
  } else {
    const { data } = await supabase
      .from('deal')
      .select('*')
      .eq('borrower_id', borrowerId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    dealRow = data;
  }
  if (!dealRow) return NextResponse.json({ error: 'No deal found for this borrower' }, { status: 404 });
  const deal = rowToApp(dealRow as Record<string, unknown>) as Record<string, unknown>;

  const { data: lendersRows } = await supabase.from('lender').select('*').eq('status', 'active');
  const lenders = rowsToApp(lendersRows ?? []);

  const ltv =
    (deal.ltv as number) ??
    ((deal.propertyValue as number) > 0
      ? ((deal.loanAmount as number) / (deal.propertyValue as number)) * 100
      : 80);
  const monthlyIncome = (borrower.income as number) / 12;
  const monthlyPayment =
    (deal.monthlyPayment as number) ?? (deal.loanAmount as number) * 0.005;
  const gds =
    (deal.gds as number) ??
    (monthlyIncome > 0 ? (monthlyPayment / monthlyIncome) * 100 : 30);
  const tds =
    (deal.tds as number) ??
    (monthlyIncome > 0
      ? ((monthlyPayment + (borrower.liabilities as number) * 0.03) / monthlyIncome) * 100
      : 40);

  const results = runMatch(
    {
      creditScore: borrower.creditScore as number,
      income: borrower.income as number,
      province: borrower.province as string,
      city: borrower.city as string,
      liabilities: borrower.liabilities as number,
    },
    {
      propertyValue: deal.propertyValue as number,
      loanAmount: deal.loanAmount as number,
      propertyType: deal.propertyType as string,
      position: deal.position as string,
      loanPurpose: deal.loanPurpose as string,
      termMonths: deal.termMonths as number,
      ltv,
      gds,
      tds,
    },
    (lenders as Record<string, unknown>[]).map((l: Record<string, unknown>) => ({
      id: l.id as string,
      name: l.name as string,
      minCreditScore: (l.minCreditScore as number) ?? 0,
      maxLTV: (l.maxLTV as number) ?? 80,
      maxGDS: (l.maxGDS as number) ?? 39,
      maxTDS: (l.maxTDS as number) ?? 44,
      supportedProvinces: (l.supportedProvinces as string[]) ?? [],
      propertyTypes: (l.propertyTypes as string[]) ?? [],
      positionTypes: (l.positionTypes as string[]) ?? [],
      minLoan: (l.minLoan as number) ?? 0,
      maxLoan: (l.maxLoan as number) ?? 999999999,
      termMin: (l.termMin as number) ?? 12,
      termMax: (l.termMax as number) ?? 360,
      baseRate: (l.baseRate as number) ?? 0,
      speed: (l.speed as number) ?? 0,
      exceptionsTolerance: (l.exceptionsTolerance as number) ?? 0,
      appetite: (l.appetite as number) ?? 0,
      pricingPremium: (l.pricingPremium as number) ?? 0,
      documentRequirements: (l.documentRequirements as string[]) ?? [],
      allowsSelfEmployed: (l.allowsSelfEmployed as boolean) ?? true,
      ruralMaxLTV: (l.ruralMaxLTV as number) ?? (l.maxLTV as number) ?? 80,
    })) as LenderData[]
  );

  const { applyToDeal, selectedLenderId } = await req.clone().json().catch(() => ({}));

  const matchRunRow = appToRow<Record<string, unknown>>({ dealId: deal.id });
  const { data: matchRunData, error: runErr } = await supabase
    .from('match_run')
    .insert(matchRunRow as TableInsert<'match_run'>)
    .select()
    .single();
  if (runErr) throw runErr;
  const matchRun = rowToApp(matchRunData as Record<string, unknown>) as { id: string };

  const snapshots = results.map((r: { lenderId: string; score: number; passed: boolean; failures: string[] }) => ({
    deal_id: deal.id,
    match_run_id: matchRun.id,
    lender_id: r.lenderId,
    score: r.score,
    passed: r.passed,
    failures: r.failures,
    snapshot: lenders.find((l: Record<string, unknown>) => l.id === r.lenderId) ?? {},
  }));
  await supabase.from('lender_match_snapshot').insert(snapshots as TableInsert<'lender_match_snapshot'>[]);

  if (applyToDeal && dealId) {
    const topMatch = results[0];
    const updateData: Record<string, unknown> = { matchScore: topMatch?.score ?? 0 };
    if (selectedLenderId) {
      updateData.lenderId = selectedLenderId;
      const specificMatch = results.find((r: { lenderId: string }) => r.lenderId === selectedLenderId);
      if (specificMatch) {
        updateData.matchScore = specificMatch.score;
        updateData.stage = 'matched';
      }
    }
    const row = appToRow<Record<string, unknown>>(updateData);
    await supabase.from('deal').update(row as TableUpdate<'deal'>).eq('id', dealId);
    await logAudit(
      'Deal',
      dealId,
      'MATCH_APPLIED',
      { lenderId: { old: undefined, new: selectedLenderId } },
      { matchRunId: matchRun.id },
      'Broker'
    );
  }

  return NextResponse.json({
    borrower,
    deal,
    results,
    matchRunId: matchRun.id,
  });
}
