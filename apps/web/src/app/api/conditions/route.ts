import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const dealId = searchParams.get('dealId');

    if (!dealId) return NextResponse.json({ error: 'dealId required' }, { status: 400 });

    const conditions = await prisma.dealCondition.findMany({
        where: { dealId },
        include: { docRequest: true },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(conditions);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const condition = await prisma.dealCondition.create({
            data: {
                dealId: body.dealId,
                description: body.description,
                status: body.status || 'pending',
                docRequestId: body.docRequestId || null
            }
        });

        await logAudit('DealCondition', condition.id, 'CREATE');

        return NextResponse.json(condition, { status: 201 });
    } catch (error: any) {
        console.error('Condition Create Error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
