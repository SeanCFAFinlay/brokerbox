import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, rowsToApp, rowToApp, appToRow } from '@/lib/db';
import type { TableInsert, TableUpdate } from '@/types/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('notification')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return NextResponse.json(rowsToApp(data ?? []));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const row = appToRow<Record<string, unknown>>(body);
    const supabase = getAdminClient();
    const { data, error } = await supabase.from('notification').insert(row as TableInsert<'notification'>).select().single();
    if (error) throw error;
    return NextResponse.json(rowToApp(data as Record<string, unknown>), { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, read } = body;
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('notification')
      .update({ read } as TableUpdate<'notification'>)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(rowToApp(data as Record<string, unknown>));
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
