import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, rowsToApp, rowToApp, appToRow } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import type { TableInsert } from '@/types/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dealId = searchParams.get('dealId');
  if (!dealId) return NextResponse.json({ error: 'dealId required' }, { status: 400 });

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('deal_condition')
    .select('*, doc_request(*)')
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return NextResponse.json(rowsToApp(data ?? []));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const row = appToRow<Record<string, unknown>>({
      dealId: body.dealId,
      description: body.description,
      status: body.status || 'pending',
      docRequestId: body.docRequestId || null,
    });
    const supabase = getAdminClient();
    const { data, error } = await supabase.from('deal_condition').insert(row as TableInsert<'deal_condition'>).select().single();
    if (error) throw error;
    const condition = rowToApp(data as Record<string, unknown>);
    await logAudit('DealCondition', (condition as { id: string }).id, 'CREATE');
    return NextResponse.json(condition, { status: 201 });
  } catch (err) {
    const e = err as Error;
    console.error('Condition Create Error:', e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
