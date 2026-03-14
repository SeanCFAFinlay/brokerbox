import { getAdminClient } from '@/lib/supabase/admin'

export async function listLenders() {
  const supabase = getAdminClient()
  return supabase.from('Lender').select('*')
}
