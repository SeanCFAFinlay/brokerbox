export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET() {
    const lenders = await prisma.lender.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(lenders);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const lender = await prisma.lender.create({ data: body });
    await logAudit('Lender', lender.id, 'CREATE');
    return NextResponse.json(lender, { status: 201 });
}
