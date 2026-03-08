import prisma from './prisma';

export async function logAudit(
    entity: string,
    entityId: string,
    action: string,
    diff?: Record<string, { old: unknown; new: unknown }>,
    metadata?: Record<string, unknown>,
    actorName: string = 'System'
) {
    await prisma.dealActivity.create({
        data: {
            actor: 'demo',
            actorName,
            entity,
            entityId,
            action,
            diff: diff as any,
            metadata: metadata as any,
        },
    });
}
