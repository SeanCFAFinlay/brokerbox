import { getAdminClient } from '@/lib/db';
import { appToRow } from '@/lib/db';
import type { TableInsert } from '@/types/supabase';

export async function logAudit(
  entity: string,
  entityId: string,
  action: string,
  diff?: Record<string, { old: unknown; new: unknown }>,
  metadata?: Record<string, unknown>,
  actorName: string = 'System'
) {
  const supabase = getAdminClient();
  const row = appToRow<Record<string, unknown>>({
    actor: 'demo',
    actorName,
    entity,
    entityId,
    action,
    diff: diff ?? null,
    metadata: metadata ?? null,
  });
  const { error } = await supabase.from('deal_activity').insert(row as TableInsert<'deal_activity'>);
  if (error) throw error;
}
