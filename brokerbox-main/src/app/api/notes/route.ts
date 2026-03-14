export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, rowsToApp, rowToApp, appToRow } from '@/lib/db';
import type { TableInsert } from '@/types/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get('entityType');
  const entityId = searchParams.get('entityId');
  if (!entityType || !entityId) {
    return NextResponse.json({ error: 'entityType and entityId required' }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('note')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return NextResponse.json(rowsToApp(data ?? []));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { entityType, entityId, content, createdBy } = body;
  if (!entityType || !entityId || !content) {
    return NextResponse.json({ error: 'entityType, entityId, and content required' }, { status: 400 });
  }

  const row = appToRow<Record<string, unknown>>({
    entityType,
    entityId,
    content,
    createdBy: createdBy || 'broker',
  });
  const supabase = getAdminClient();
  const { data, error } = await supabase.from('note').insert(row as TableInsert<'note'>).select().single();
  if (error) throw error;
  return NextResponse.json(rowToApp(data as Record<string, unknown>), { status: 201 });
}
