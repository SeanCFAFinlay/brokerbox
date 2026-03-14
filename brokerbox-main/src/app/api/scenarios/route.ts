export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, rowsToApp, rowToApp, appToRow } from '@/lib/db';
import { computeScenario } from '@/lib/scenarioEngine';
import { logAudit } from '@/lib/audit';
import type { TableInsert } from '@/types/supabase';

export async function GET(req: NextRequest) {
  const borrowerId = req.nextUrl.searchParams.get('borrowerId');
  const dealId = req.nextUrl.searchParams.get('dealId');

  const supabase = getAdminClient();
  let q = supabase
    .from('scenario')
    .select('*, deal(id, property_address, loan_amount, loan_purpose)')
    .order('created_at', { ascending: false });
  if (borrowerId) q = q.eq('borrower_id', borrowerId);
  if (dealId) q = q.eq('deal_id', dealId);

  const { data, error } = await q;
  if (error) throw error;
  return NextResponse.json(rowsToApp(data ?? []));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = { ...body };
  if (body.type && body.inputs) {
    data.results = computeScenario(body.type, body.inputs);
    data.exitCost = data.results.exitCost;
  }

  const row = appToRow<Record<string, unknown>>(data);
  const supabase = getAdminClient();
  const { data: inserted, error } = await supabase.from('scenario').insert(row as TableInsert<'scenario'>).select().single();
  if (error) throw error;
  const scenario = rowToApp(inserted as Record<string, unknown>);
  await logAudit('Scenario', (scenario as { id: string }).id, 'CREATE', undefined, { type: body.type }, 'Broker');
  return NextResponse.json(scenario, { status: 201 });
}
