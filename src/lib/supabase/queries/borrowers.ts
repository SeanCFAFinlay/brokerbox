import { getAdminClient } from '@/lib/supabase/admin'

export async function listBorrowers() {
  const supabase = getAdminClient()
  return supabase.from('Borrower').select('*')
}
