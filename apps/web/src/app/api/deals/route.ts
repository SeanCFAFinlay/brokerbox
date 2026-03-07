export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET() {
    const deals = await prisma.deal.findMany({ orderBy: { updatedAt: 'desc' }, include: { borrower: true, lender: true } });
    return NextResponse.json(deals);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    // compute LTV
    if (body.propertyValue && body.loanAmount) {
        body.ltv = (body.loanAmount / body.propertyValue) * 100;
    }
    const deal = await prisma.deal.create({ data: body });
    await logAudit('Deal', deal.id, 'CREATE');
    return NextResponse.json(deal, { status: 201 });
}
