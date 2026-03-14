import { getAdminClient } from '@/lib/supabase/admin'

export async function listDeals() {
  const supabase = getAdminClient()
  return supabase.from('Deal').select('*')
}
