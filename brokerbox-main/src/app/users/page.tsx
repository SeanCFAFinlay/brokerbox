import UsersClient from './UsersClient';
import { getAdminClient, rowsToApp } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const users = rowsToApp((data ?? []) as Record<string, unknown>[]) as unknown as Parameters<typeof UsersClient>[0]['users'];

  return <UsersClient users={users} />;
}
