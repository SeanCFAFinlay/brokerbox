import { getAdminClient } from '@/lib/supabase/admin'

export async function logAudit(
  entity: string,
  entityId: string,
  action: string,
  diff?: Record<string, { old: unknown; new: unknown }> | Record<string, unknown>,
  metadata?: Record<string, unknown>,
  actorName: string = 'System'
) {
  const supabase = getAdminClient()

  const { error } = await supabase.from('DealActivity').insert({
    actor: 'demo',
    actorName,
    entity,
    entityId,
    action,
    diff: diff ?? null,
    metadata: metadata ?? null,
  })

  if (error) {
    console.error('logAudit failed:', error)
    throw error
  }
}
