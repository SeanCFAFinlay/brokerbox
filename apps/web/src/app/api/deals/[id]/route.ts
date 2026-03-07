export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const deal = await prisma.deal.findUnique({
        where: { id },
        include: {
            borrower: true,
            lender: true,
            docRequests: { include: { files: true } },
            stageHistory: { orderBy: { changedAt: 'desc' } },
            scenarios: { orderBy: { createdAt: 'desc' } },
        },
    });
    if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(deal);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();

    // Compute LTV if both values present
    if (body.propertyValue && body.loanAmount) {
        body.ltv = (body.loanAmount / body.propertyValue) * 100;
    }

    const old = await prisma.deal.findUnique({ where: { id } });
    if (!old) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Track stage change
    if (body.stage && body.stage !== old.stage) {
        await prisma.dealStageHistory.create({
            data: {
                dealId: id,
                fromStage: old.stage,
                toStage: body.stage,
                changedBy: body.changedBy || 'broker',
            },
        });
    }

    // Remove non-schema fields
    delete body.changedBy;

    const deal = await prisma.deal.update({ where: { id }, data: body });

    const diff: Record<string, { old: unknown; new: unknown }> = {};
    for (const key of Object.keys(body)) {
        if ((old as Record<string, unknown>)[key] !== body[key]) {
            diff[key] = { old: (old as Record<string, unknown>)[key], new: body[key] };
        }
    }
    await logAudit('Deal', id, body.stage && body.stage !== old.stage ? 'STAGE_CHANGE' : 'UPDATE', diff);

    return NextResponse.json(deal);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await prisma.deal.delete({ where: { id } });
    await logAudit('Deal', id, 'DELETE');
    return NextResponse.json({ ok: true });
}
