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
  const row = appToRow<Record<string, unknown>>(body);
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('doc_request')
    .update(row as TableUpdate<'doc_request'>)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  await logAudit('DocRequest', id, 'UPDATE', {
    status: { old: '', new: body.status },
  });
  return NextResponse.json(rowToApp(data as Record<string, unknown>));
}
