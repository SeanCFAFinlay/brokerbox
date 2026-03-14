import { getAdminClient } from '@/lib/supabase/admin'

export async function listUsers() {
  const supabase = getAdminClient()
  return supabase.from('User').select('*')
}
