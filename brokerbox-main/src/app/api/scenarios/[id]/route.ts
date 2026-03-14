export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, rowToApp, appToRow } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import type { TableUpdate } from '@/types/supabase';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const supabase = getAdminClient();
  const { data: oldRow } = await supabase.from('scenario').select('*').eq('id', id).single();
  if (!oldRow) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const row = appToRow<Record<string, unknown>>(body);
  const { data, error } = await supabase.from('scenario').update(row as TableUpdate<'scenario'>).eq('id', id).select().single();
  if (error) throw error;
  const scenario = rowToApp(data as Record<string, unknown>);

  const old = rowToApp(oldRow as Record<string, unknown>) as Record<string, unknown>;
  const diff: Record<string, { old: unknown; new: unknown }> = {};
  for (const key of Object.keys(body)) {
    if (old[key] !== body[key]) diff[key] = { old: old[key], new: body[key] };
  }
  await logAudit('Scenario', id, 'UPDATE', diff);
  return NextResponse.json(scenario);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getAdminClient();
  const { error } = await supabase.from('scenario').delete().eq('id', id);
  if (error) throw error;
  await logAudit('Scenario', id, 'DELETE');
  return NextResponse.json({ ok: true });
}
