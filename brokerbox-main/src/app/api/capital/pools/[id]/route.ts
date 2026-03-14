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
  const update: Record<string, unknown> = { ...body };
  if (body.totalAmount != null) {
    update.utilizationRate =
      (body.totalAmount - (body.availableAmount ?? 0)) / body.totalAmount * 100;
  }
  const row = appToRow<Record<string, unknown>>(update);
  const supabase = getAdminClient();
  const { data, error } = await supabase.from('capital_pool').update(row as TableUpdate<'capital_pool'>).eq('id', id).select().single();
  if (error) throw error;
  await logAudit('CapitalPool', id, 'UPDATE', body as Record<string, { old: unknown; new: unknown }>);
  return NextResponse.json(rowToApp(data as Record<string, unknown>));
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getAdminClient();
  const { error } = await supabase.from('capital_pool').delete().eq('id', id);
  if (error) throw error;
  await logAudit('CapitalPool', id, 'DELETE');
  return NextResponse.json({ ok: true });
}
