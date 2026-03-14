export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, rowToApp, appToRow } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import type { TableUpdate } from '@/types/supabase';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('lender')
    .select('*, deal(*)')
    .eq('id', id)
    .single();
  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const lender = rowToApp(data as Record<string, unknown>) as Record<string, unknown>;
  if (lender.deal) {
    lender.deals = Array.isArray(lender.deal) ? lender.deal : [lender.deal];
    delete lender.deal;
  }
  return NextResponse.json(lender);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const supabase = getAdminClient();
  const { data: oldRow } = await supabase.from('lender').select('*').eq('id', id).single();
  if (!oldRow) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const row = appToRow<Record<string, unknown>>(body);
  const { data, error } = await supabase.from('lender').update(row as TableUpdate<'lender'>).eq('id', id).select().single();
  if (error) throw error;
  const lender = rowToApp(data as Record<string, unknown>);
  const old = rowToApp(oldRow as Record<string, unknown>) as Record<string, unknown>;
  const diff: Record<string, { old: unknown; new: unknown }> = {};
  for (const key of Object.keys(body)) {
    if (old[key] !== body[key]) diff[key] = { old: old[key], new: body[key] };
  }
  await logAudit('Lender', id, 'UPDATE', diff);
  return NextResponse.json(lender);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getAdminClient();
  const { error } = await supabase.from('lender').delete().eq('id', id);
  if (error) throw error;
  await logAudit('Lender', id, 'DELETE');
  return NextResponse.json({ ok: true });
}
