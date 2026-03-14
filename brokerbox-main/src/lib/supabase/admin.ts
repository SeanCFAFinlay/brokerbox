import { createClient, SupabaseClient } from '@supabase/supabase-js';

/** Supabase admin client. Use for all server-side DB access. Left untyped so insert/update accept payloads. */
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  const client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return client as SupabaseClient;
}

// Singleton for server-side use (route handlers, server actions)
let adminClient: SupabaseClient | null = null;

export function getAdminClient() {
  if (!adminClient) {
    adminClient = createAdminClient();
  }
  return adminClient;
}
