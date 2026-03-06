import prisma from './prisma';

export async function logAudit(
    entity: string,
    entityId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    diff?: Record<string, { old: unknown; new: unknown }>
) {
    await prisma.auditLog.create({
        data: {
            actor: 'demo',
            entity,
            entityId,
            action,
            diff: diff as any,
        },
    });
}
