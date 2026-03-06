import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();
    const doc = await prisma.docRequest.update({ where: { id }, data: body });
    await logAudit('DocRequest', id, 'UPDATE', { status: { old: '', new: body.status } });
    return NextResponse.json(doc);
}
