'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function updateDealStage(dealId: string, newStage: string) {
    const { data: old } = await supabase.from('Deal').select('stage').eq('id', dealId).single();
    if (!old || old.stage === newStage) return;

    await supabase.from('Deal').update({ stage: newStage }).eq('id', dealId);

    // Track stage history
    await supabase.from('DealStageHistory').insert({
        dealId,
        fromStage: old.stage,
        toStage: newStage,
        changedBy: 'broker',
    });

    // Activity tracking
    await supabase.from('DealActivity').insert({
        actor: 'demo',
        actorName: 'System',
        entity: 'Deal',
        entityId: dealId,
        action: 'STAGE_CHANGE',
        diff: { from: old.stage, to: newStage } as any,
    });

    revalidatePath('/deals');
    revalidatePath('/');

    // Auto-sync to Outlook if enabled
    try {
        const { syncToOutlook } = await import('@/lib/outlook');
        await syncToOutlook('demo'); // Defaulting to demo for now, should use authenticated user
    } catch (e) {
        console.error('Outlook sync failed:', e);
    }
}
