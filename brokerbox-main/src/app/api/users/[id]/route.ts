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
      .from('user')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();
    if (!oldRow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const oldUser = rowToApp(oldRow as Record<string, unknown>) as Record<string, unknown>;

    const dataToUpdate: Record<string, unknown> = {};
    if (body.role !== undefined) dataToUpdate.role = body.role;
    if (body.baseCommissionSplit !== undefined) {
      dataToUpdate.baseCommissionSplit = Number(body.baseCommissionSplit);
    }

    const row = appToRow<Record<string, unknown>>(dataToUpdate);
    const { data: updatedRow, error } = await supabase
      .from('user')
      .update(row as TableUpdate<'user'>)
      .eq('id', resolvedParams.id)
      .select()
      .single();
    if (error) throw error;
    const updatedUser = rowToApp(updatedRow as Record<string, unknown>) as Record<string, unknown>;

    const diff: Record<string, { old: unknown; new: unknown }> = {};
    if (body.role !== undefined && body.role !== oldUser.role) {
      diff.role = { old: oldUser.role, new: body.role };
    }
    if (
      body.baseCommissionSplit !== undefined &&
      Number(body.baseCommissionSplit) !== oldUser.baseCommissionSplit
    ) {
      diff.baseCommissionSplit = {
        old: oldUser.baseCommissionSplit,
        new: Number(body.baseCommissionSplit),
      };
    }
    await logAudit('User', (updatedUser.id as string), 'UPDATE', diff);
    return NextResponse.json(updatedUser);
  } catch (err) {
    const e = err as Error;
    console.error('Error updating user:', e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
