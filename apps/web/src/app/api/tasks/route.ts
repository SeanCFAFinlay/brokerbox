import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { syncToCalendar } from '@/lib/calendar';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const assignedToId = searchParams.get('assignedToId');
    const status = searchParams.get('status');

    let where: any = {};
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
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Ensure dueDate is properly formatted as ISO string if present
        if (body.dueDate) {
            body.dueDate = new Date(body.dueDate);
        }

        const task = await prisma.task.create({
            data: {
                title: body.title,
                description: body.description,
                dueDate: body.dueDate,
                status: body.status || 'pending',
                assignedToId: body.assignedToId,
                entityType: body.entityType,
                entityId: body.entityId,
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
    } catch (error: any) {
        console.error('Task Create Error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
