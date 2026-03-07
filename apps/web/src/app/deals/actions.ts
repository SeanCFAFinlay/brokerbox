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

    // Audit log
    await prisma.auditLog.create({
        data: {
            entity: 'Deal',
            entityId: dealId,
            action: 'STAGE_CHANGE',
            diff: { from: old.stage, to: newStage },
        },
    });

    revalidatePath('/deals');
    revalidatePath('/');
}
