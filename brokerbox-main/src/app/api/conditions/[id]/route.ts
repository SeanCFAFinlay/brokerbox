import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, rowToApp, appToRow } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import type { TableUpdate } from '@/types/supabase';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await req.json();

    const supabase = getAdminClient();
    const { data: oldRow } = await supabase
      .from('deal_condition')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();
    const oldCondition = oldRow ? (rowToApp(oldRow as Record<string, unknown>) as Record<string, unknown>) : null;

    let clearedAt: Date | null = oldCondition?.clearedAt as Date | null | undefined;
    if (body.status && body.status !== 'pending' && oldCondition?.status === 'pending') {
      clearedAt = new Date();
    } else if (body.status === 'pending') {
      clearedAt = null;
    }

    const row = appToRow<Record<string, unknown>>({ ...body, clearedAt });
    const { data, error } = await supabase
      .from('deal_condition')
      .update(row as TableUpdate<'deal_condition'>)
      .eq('id', resolvedParams.id)
      .select()
      .single();
    if (error) throw error;
    const condition = rowToApp(data as Record<string, unknown>);

    const diff: Record<string, { old: unknown; new: unknown }> = {};
    if (body.status !== undefined && body.status !== oldCondition?.status) {
      diff.status = { old: oldCondition?.status, new: body.status };
    }
    if (body.description !== undefined && body.description !== oldCondition?.description) {
      diff.description = { old: oldCondition?.description, new: body.description };
    }
    await logAudit('DealCondition', (condition as { id: string }).id, 'UPDATE', diff);

    return NextResponse.json(condition);
  } catch (err) {
    const e = err as Error;
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const supabase = getAdminClient();
    const { data: cond } = await supabase
      .from('deal_condition')
      .select('id')
      .eq('id', resolvedParams.id)
      .single();
    if (cond) {
      await supabase.from('deal_condition').delete().eq('id', resolvedParams.id);
      await logAudit('DealCondition', resolvedParams.id, 'DELETE');
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    const e = err as Error;
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
