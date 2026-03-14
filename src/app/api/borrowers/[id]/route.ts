export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const borrower = await prisma.borrower.findUnique({ where: { id }, include: { deals: { include: { lender: true } }, scenarios: true, docRequests: { include: { files: true } } } });
    if (!borrower) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(borrower);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();
    const old = await prisma.borrower.findUnique({ where: { id } });
    const borrower = await prisma.borrower.update({ where: { id }, data: body });
    const diff: Record<string, { old: unknown; new: unknown }> = {};
    for (const key of Object.keys(body)) {
        if (old && (old as Record<string, unknown>)[key] !== body[key]) {
            diff[key] = { old: (old as Record<string, unknown>)[key], new: body[key] };
        }
    }
    await logAudit('Borrower', id, 'UPDATE', diff);
    return NextResponse.json(borrower);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await prisma.borrower.delete({ where: { id } });
    await logAudit('Borrower', id, 'DELETE');
    return NextResponse.json({ ok: true });
}
