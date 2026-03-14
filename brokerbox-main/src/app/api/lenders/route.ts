export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, rowsToApp, rowToApp, appToRow } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import type { TableInsert } from '@/types/supabase';

export async function GET() {
  const supabase = getAdminClient();
  const { data, error } = await supabase.from('lender').select('*').order('name', { ascending: true });
  if (error) throw error;
  return NextResponse.json(rowsToApp(data ?? []));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const row = appToRow<Record<string, unknown>>(body);
  const supabase = getAdminClient();
  const { data, error } = await supabase.from('lender').insert(row as TableInsert<'lender'>).select().single();
  if (error) throw error;
  const lender = rowToApp(data as Record<string, unknown>);
  await logAudit('Lender', (lender as { id: string }).id, 'CREATE');
  return NextResponse.json(lender, { status: 201 });
}
