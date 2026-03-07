export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET() {
    const docs = await prisma.docRequest.findMany({
        orderBy: { createdAt: 'desc' },
        include: { files: true },
    });
    return NextResponse.json(docs);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const doc = await prisma.docRequest.create({ data: body });
    await logAudit('DocRequest', doc.id, 'CREATE');
    return NextResponse.json(doc, { status: 201 });
}
