import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, rowsToApp } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(rowsToApp(data ?? []));
  } catch (err) {
    const e = err as Error;
    console.error('Error fetching users:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
