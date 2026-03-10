export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { parseBody, handlePrismaError } from '@/lib/api';
import { updateDealSchema } from '@/lib/schemas';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
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
    } catch (err) {
        return handlePrismaError(err);
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const raw = await req.json();
        const parsed = parseBody(updateDealSchema, raw);
        if (parsed.success === false) return parsed.response;
        const body = { ...parsed.data };
        const changedBy = body.changedBy ?? 'broker';
        const { changedBy: _drop, ...updateData } = body as typeof body & { changedBy?: string };
        if (typeof updateData.propertyValue === 'number' && typeof updateData.loanAmount === 'number') {
            (updateData as Record<string, unknown>).ltv = (updateData.loanAmount / updateData.propertyValue) * 100;
        }

        const old = await prisma.deal.findUnique({ where: { id } });
        if (!old) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        if (updateData.stage && updateData.stage !== old.stage) {
            await prisma.dealStageHistory.create({
                data: {
                    dealId: id,
                    fromStage: old.stage,
                    toStage: updateData.stage,
                    changedBy,
                },
            });
        }

        const deal = await prisma.deal.update({ where: { id }, data: updateData });

        const diff: Record<string, { old: unknown; new: unknown }> = {};
        for (const key of Object.keys(updateData)) {
            if ((old as Record<string, unknown>)[key] !== (updateData as Record<string, unknown>)[key]) {
                diff[key] = { old: (old as Record<string, unknown>)[key], new: (updateData as Record<string, unknown>)[key] };
            }
        }
        await logAudit('Deal', id, 'UPDATE', diff);
        return NextResponse.json(deal);
    } catch (err) {
        return handlePrismaError(err);
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.deal.delete({ where: { id } });
        await logAudit('Deal', id, 'DELETE');
        return NextResponse.json({ ok: true });
    } catch (err) {
        return handlePrismaError(err);
    }
}
