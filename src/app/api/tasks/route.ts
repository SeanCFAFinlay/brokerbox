import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { syncToCalendar } from '@/lib/calendar';
import { parseBody, handlePrismaError } from '@/lib/api';
import { createTaskSchema } from '@/lib/schemas';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const entityType = searchParams.get('entityType');
        const entityId = searchParams.get('entityId');
        const assignedToId = searchParams.get('assignedToId');
        const status = searchParams.get('status');

        const where: Record<string, string> = {};
        if (entityType && entityId) {
            where.entityType = entityType;
            where.entityId = entityId;
        }
        if (assignedToId) where.assignedToId = assignedToId;
        if (status) where.status = status;

        const tasks = await prisma.task.findMany({
            where,
            orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }]
        });
        return NextResponse.json(tasks);
    } catch (err) {
        return handlePrismaError(err);
    }
}

export async function POST(req: NextRequest) {
    try {
        const raw = await req.json();
        const parsed = parseBody(createTaskSchema, raw);
        if (parsed.success === false) return parsed.response;
        const d = parsed.data;
        const dueDate = d.dueDate != null ? new Date(d.dueDate as string | Date) : null;
        const task = await prisma.task.create({
            data: {
                title: d.title,
                description: d.description ?? undefined,
                dueDate,
                status: (d.status as 'pending' | 'completed') ?? 'pending',
                assignedToId: d.assignedToId ?? undefined,
                entityType: d.entityType ?? undefined,
                entityId: d.entityId ?? undefined,
                dealId: d.dealId ?? undefined,
            }
        });

        if (task.dueDate) {
            await syncToCalendar({
                title: `Task: ${task.title}`,
                description: task.description || '',
                startTime: task.dueDate,
                eventType: 'task',
                sourceId: task.id,
                sourceType: 'Task'
            });
        }

        await logAudit('Task', task.id, 'CREATE');
        return NextResponse.json(task, { status: 201 });
    } catch (err) {
        return handlePrismaError(err);
    }
}
