export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { logAudit } from '@/lib/audit';
import { selectBorrowerById } from '@/lib/supabase/queries';
import { getAdminClient, rowToApp, appToRow } from '@/lib/db';
import type { TableUpdate } from '@/types/supabase';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const borrower = await selectBorrowerById(id);
    return NextResponse.json(borrower);
  } catch (err) {
    if (err instanceof Error && err.message === 'Not found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    throw err;
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = getAdminClient();
    const { data: oldRow } = await supabase.from('borrower').select('*').eq('id', id).single();
    if (!oldRow) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const row = appToRow<Record<string, unknown>>(body);
    const { data, error } = await supabase.from('borrower').update(row as TableUpdate<'borrower'>).eq('id', id).select().single();
    if (error) throw error;
    const borrower = rowToApp(data as Record<string, unknown>);
    const old = rowToApp(oldRow as Record<string, unknown>) as Record<string, unknown>;
    const diff: Record<string, { old: unknown; new: unknown }> = {};
    for (const key of Object.keys(body)) {
      if (old[key] !== body[key]) {
        diff[key] = { old: old[key], new: body[key] };
      }
    }
    await logAudit('Borrower', id, 'UPDATE', diff);
    return NextResponse.json(borrower);
  } catch (err) {
    throw err;
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getAdminClient();
    const { error } = await supabase.from('borrower').delete().eq('id', id);
    if (error) throw error;
    await logAudit('Borrower', id, 'DELETE');
    return NextResponse.json({ ok: true });
  } catch (err) {
    throw err;
  }
}
