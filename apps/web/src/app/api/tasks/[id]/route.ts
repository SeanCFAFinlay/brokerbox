import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const body = await req.json();

        if (body.dueDate) {
            body.dueDate = new Date(body.dueDate);
        }

        const oldTask = await prisma.task.findUnique({ where: { id: resolvedParams.id } });
        const task = await prisma.task.update({
            where: { id: resolvedParams.id },
            data: body
        });

        let diff: any = {};
        for (const [k, v] of Object.entries(body)) {
            if (oldTask && (oldTask as any)[k] !== v) {
                diff[k] = { old: (oldTask as any)[k], new: v };
            }
        }
        await logAudit('Task', task.id, 'UPDATE', diff);

        return NextResponse.json(task);
    } catch (error: any) {
        console.error('Task Update Error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const task = await prisma.task.delete({
            where: { id: resolvedParams.id }
        });

        await logAudit('Task', resolvedParams.id, 'DELETE');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
