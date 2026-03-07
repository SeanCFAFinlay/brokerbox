export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET() {
    const borrowers = await prisma.borrower.findMany({ orderBy: { updatedAt: 'desc' } });
    return NextResponse.json(borrowers);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const borrower = await prisma.borrower.create({ data: body });
    await logAudit('Borrower', borrower.id, 'CREATE');
    return NextResponse.json(borrower, { status: 201 });
}
