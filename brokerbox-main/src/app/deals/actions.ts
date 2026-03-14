'use server';

import { getAdminClient, rowToApp } from '@/lib/db';
import { insertDealStageHistory, updateDeal } from '@/lib/supabase/queries';
import { revalidatePath } from 'next/cache';

export async function updateDealStage(dealId: string, newStage: string) {
  const supabase = getAdminClient();
  const { data: oldRow } = await supabase.from('deal').select('*').eq('id', dealId).single();
  if (!oldRow) return;
  const old = rowToApp(oldRow as Record<string, unknown>) as { stage: string };
  if (old.stage === newStage) return;

  await updateDeal(dealId, { stage: newStage });

  await insertDealStageHistory({
    dealId,
    fromStage: old.stage,
    toStage: newStage,
    changedBy: 'broker',
  });

  const { logAudit } = await import('@/lib/audit');
  await logAudit('Deal', dealId, 'STAGE_CHANGE', { stage: { old: old.stage, new: newStage } });

  revalidatePath('/deals');
  revalidatePath('/');

  try {
    const { syncToOutlook } = await import('@/lib/outlook');
    await syncToOutlook('demo');
  } catch (e) {
    console.error('Outlook sync failed:', e);
  }
}
