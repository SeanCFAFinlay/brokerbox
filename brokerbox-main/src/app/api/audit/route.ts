import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, rowsToApp } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get('entityType');
  const entityId = searchParams.get('entityId');

  if (!entityType || !entityId) {
    return NextResponse.json({ error: 'entityType and entityId are required' }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('deal_activity')
    .select('*')
    .eq('entity', entityType)
    .eq('entity_id', entityId)
    .order('timestamp', { ascending: false })
    .limit(50);
  if (error) throw error;
  const logs = rowsToApp((data ?? []) as Record<string, unknown>[]);
  return NextResponse.json(logs);
}
