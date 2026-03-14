export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, rowsToApp, rowToApp, appToRow } from '@/lib/db';
import type { TableInsert } from '@/types/supabase';
import { logAudit } from '@/lib/audit';
import { parseBody, handleDbError } from '@/lib/api';
import { createBorrowerSchema } from '@/lib/schemas';

export async function GET() {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('borrower')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    const borrowers = rowsToApp(data ?? []);
    return NextResponse.json(borrowers);
  } catch (err) {
    return handleDbError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const parsed = parseBody(createBorrowerSchema, raw);
    if (parsed.success === false) return parsed.response;
    const row = appToRow<Record<string, unknown>>(parsed.data as Record<string, unknown>);
    const supabase = getAdminClient();
    const { data, error } = await supabase.from('borrower').insert(row as TableInsert<'borrower'>).select().single();
    if (error) throw error;
    const borrower = rowToApp(data as Record<string, unknown>);
    await logAudit('Borrower', (borrower as { id: string }).id, 'CREATE');
    return NextResponse.json(borrower, { status: 201 });
  } catch (err) {
    return handleDbError(err);
  }
}
