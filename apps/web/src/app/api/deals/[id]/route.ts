export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const deal = await prisma.deal.findUnique({ where: { id }, include: { borrower: true, lender: true, docRequests: { include: { files: true } } } });
    if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(deal);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();
    if (body.propertyValue && body.loanAmount) {
        body.ltv = (body.loanAmount / body.propertyValue) * 100;
    }
    const old = await prisma.deal.findUnique({ where: { id } });
    const deal = await prisma.deal.update({ where: { id }, data: body });
    const diff: Record<string, { old: unknown; new: unknown }> = {};
    for (const key of Object.keys(body)) {
        if (old && (old as Record<string, unknown>)[key] !== body[key]) {
            diff[key] = { old: (old as Record<string, unknown>)[key], new: body[key] };
        }
    }
    await logAudit('Deal', id, 'UPDATE', diff);
    return NextResponse.json(deal);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await prisma.deal.delete({ where: { id } });
    await logAudit('Deal', id, 'DELETE');
    return NextResponse.json({ ok: true });
}
