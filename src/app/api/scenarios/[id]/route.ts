export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();

    const old = await prisma.scenario.findUnique({ where: { id } });
    if (!old) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const scenario = await prisma.scenario.update({ where: { id }, data: body });

    // Audit difference
    const diff: Record<string, { old: any; new: any }> = {};
    for (const key of Object.keys(body)) {
        if ((old as any)[key] !== body[key]) {
            diff[key] = { old: (old as any)[key], new: body[key] };
        }
    }

    await logAudit('Scenario', id, 'UPDATE', diff);
    return NextResponse.json(scenario);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await prisma.scenario.delete({ where: { id } });
    await logAudit('Scenario', id, 'DELETE');
    return NextResponse.json({ ok: true });
}
