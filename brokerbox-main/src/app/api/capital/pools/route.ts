import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, rowsToApp, rowToApp, appToRow } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import type { TableInsert, TableUpdate } from '@/types/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('capital_pool')
    .select('*, lender(*), investment(*, user(*))')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return NextResponse.json(rowsToApp(data ?? []));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const totalAmount = Number(body.totalAmount);
  const availableAmount = Number(body.availableAmount) ?? totalAmount;
  const utilizationRate = totalAmount ? ((totalAmount - availableAmount) / totalAmount) * 100 : 0;

  const row = appToRow<Record<string, unknown>>({
    name: body.name,
    totalAmount,
    availableAmount,
    utilizationRate,
    effectiveLTV: Number(body.effectiveLTV) || 75,
    minInvestment: Number(body.minInvestment) || 50000,
    targetYield: Number(body.targetYield) || 8.0,
    lenderId: body.lenderId,
  });

  const supabase = getAdminClient();
  const { data: poolRow, error } = await supabase.from('capital_pool').insert(row as TableInsert<'capital_pool'>).select().single();
  if (error) throw error;
  const pool = rowToApp(poolRow as Record<string, unknown>) as { id: string };

  await logAudit('CapitalPool', pool.id, 'CREATE');

  const { data: allPools } = await supabase
    .from('capital_pool')
    .select('available_amount')
    .eq('lender_id', body.lenderId);
  const newCapital = (allPools ?? []).reduce((sum: number, p: { available_amount: number }) => sum + p.available_amount, 0);
  await supabase.from('lender').update({ capital_available: newCapital } as TableUpdate<'lender'>).eq('id', body.lenderId);

  return NextResponse.json(pool, { status: 201 });
}
