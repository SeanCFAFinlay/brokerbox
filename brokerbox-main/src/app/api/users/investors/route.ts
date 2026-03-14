import { NextResponse } from 'next/server';
import { getAdminClient, rowsToApp } from '@/lib/db';

export async function GET() {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('user')
    .select('id, name, email')
    .eq('role', 'investor');
  if (error) throw error;
  return NextResponse.json(rowsToApp(data ?? []));
}
