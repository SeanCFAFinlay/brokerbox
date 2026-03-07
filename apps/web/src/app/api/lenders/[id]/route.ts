export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const lender = await prisma.lender.findUnique({ where: { id }, include: { deals: true } });
    if (!lender) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(lender);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();
    const old = await prisma.lender.findUnique({ where: { id } });
    const lender = await prisma.lender.update({ where: { id }, data: body });
    const diff: Record<string, { old: unknown; new: unknown }> = {};
    for (const key of Object.keys(body)) {
        if (old && (old as Record<string, unknown>)[key] !== body[key]) {
            diff[key] = { old: (old as Record<string, unknown>)[key], new: body[key] };
        }
    }
    await logAudit('Lender', id, 'UPDATE', diff);
    return NextResponse.json(lender);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await prisma.lender.delete({ where: { id } });
    await logAudit('Lender', id, 'DELETE');
    return NextResponse.json({ ok: true });
}
