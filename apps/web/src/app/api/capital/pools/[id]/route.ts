import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();

    const pool = await prisma.capitalPool.update({
        where: { id },
        data: {
            ...body,
            utilizationRate: body.totalAmount ? (body.totalAmount - (body.availableAmount || 0)) / body.totalAmount * 100 : undefined
        }
    });

    await logAudit('CapitalPool', id, 'UPDATE', body);
    return NextResponse.json(pool);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await prisma.capitalPool.delete({ where: { id } });
    await logAudit('CapitalPool', id, 'DELETE');
    return NextResponse.json({ ok: true });
}
