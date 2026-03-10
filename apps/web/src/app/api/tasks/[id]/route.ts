import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { parseBody, handlePrismaError } from '@/lib/api';
import { updateTaskSchema } from '@/lib/schemas';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const raw = await req.json();
        const parsed = parseBody(updateTaskSchema, raw);
        if (parsed.success === false) return parsed.response;
        const d = parsed.data;
        const dueDate = d.dueDate != null ? new Date(d.dueDate as string | Date) : undefined;
        const data: Record<string, unknown> = {
            ...(d.title !== undefined && { title: d.title }),
            ...(d.description !== undefined && { description: d.description }),
            ...(dueDate !== undefined && { dueDate }),
            ...(d.status !== undefined && { status: d.status }),
            ...(d.priority !== undefined && { priority: d.priority }),
            ...(d.assignedToId !== undefined && { assignedToId: d.assignedToId }),
            ...(d.entityType !== undefined && { entityType: d.entityType }),
            ...(d.entityId !== undefined && { entityId: d.entityId }),
        };

        const oldTask = await prisma.task.findUnique({ where: { id: resolvedParams.id } });
        if (!oldTask) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const task = await prisma.task.update({
            where: { id: resolvedParams.id },
            data
        });

        const diff: Record<string, { old: unknown; new: unknown }> = {};
        for (const [k, v] of Object.entries(data)) {
            if ((oldTask as Record<string, unknown>)[k] !== v) {
                diff[k] = { old: (oldTask as Record<string, unknown>)[k], new: v };
            }
        }
        await logAudit('Task', task.id, 'UPDATE', diff);
        return NextResponse.json(task);
    } catch (err) {
        return handlePrismaError(err);
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        await prisma.task.delete({ where: { id: resolvedParams.id } });
        await logAudit('Task', resolvedParams.id, 'DELETE');
        return NextResponse.json({ success: true });
    } catch (err) {
        return handlePrismaError(err);
    }
}
