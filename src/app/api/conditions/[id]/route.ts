import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const body = await req.json();

        const oldCondition = await prisma.dealCondition.findUnique({ where: { id: resolvedParams.id } });

        // Auto-set clearedAt if status becomes 'met' or 'waived'
        let clearedAt = oldCondition?.clearedAt;
        if (body.status && body.status !== 'pending' && oldCondition?.status === 'pending') {
            clearedAt = new Date();
        } else if (body.status === 'pending') {
            clearedAt = null;
        }

        const condition = await prisma.dealCondition.update({
            where: { id: resolvedParams.id },
            data: {
                ...body,
                clearedAt
            }
        });

        const diff: Record<string, { old: any, new: any }> = {};
        if (body.status !== undefined && body.status !== oldCondition?.status) diff.status = { old: oldCondition?.status, new: body.status };
        if (body.description !== undefined && body.description !== oldCondition?.description) diff.description = { old: oldCondition?.description, new: body.description };

        await logAudit('DealCondition', condition.id, 'UPDATE', diff);

        return NextResponse.json(condition);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const cond = await prisma.dealCondition.findUnique({ where: { id: resolvedParams.id } });
        if (cond) {
            await prisma.dealCondition.delete({ where: { id: resolvedParams.id } });
            await logAudit('DealCondition', resolvedParams.id, 'DELETE');
        }
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
