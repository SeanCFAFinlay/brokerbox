'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateDealStage(dealId: string, newStage: string) {
    const old = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!old || old.stage === newStage) return;

    await prisma.deal.update({
        where: { id: dealId },
        data: { stage: newStage },
    });

    // Track stage history
    await prisma.dealStageHistory.create({
        data: {
            dealId,
            fromStage: old.stage,
            toStage: newStage,
            changedBy: 'broker',
        },
    });

    // Activity tracking
    await prisma.dealActivity.create({
        data: {
            actor: 'demo',
            actorName: 'System',
            entity: 'Deal',
            entityId: dealId,
            action: 'STAGE_CHANGE',
            diff: { from: old.stage, to: newStage } as any,
        },
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
