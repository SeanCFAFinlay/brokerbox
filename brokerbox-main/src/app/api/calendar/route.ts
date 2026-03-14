import { NextResponse } from 'next/server';
import { getAdminClient, rowsToApp } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('calendar_event')
    .select('*')
    .eq('status', 'active')
    .order('start_time', { ascending: true });
  if (error) throw error;
  return NextResponse.json(rowsToApp(data ?? []));
}
