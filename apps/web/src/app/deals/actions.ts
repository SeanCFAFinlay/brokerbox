'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateDealStage(dealId: string, newStage: string) {
    await prisma.deal.update({
        where: { id: dealId },
        data: { stage: newStage }
    });

    // Also log the stage change
    await prisma.auditLog.create({
        data: {
            entity: 'Deal',
            entityId: dealId,
            action: `Moved to ${newStage}`,
        }
    });

    revalidatePath('/deals');
    revalidatePath('/');
}
