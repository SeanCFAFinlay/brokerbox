export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { parseBody, handlePrismaError } from '@/lib/api';
import { createDealSchema } from '@/lib/schemas';

export async function GET() {
    try {
        const deals = await prisma.deal.findMany({ orderBy: { updatedAt: 'desc' }, include: { borrower: true, lender: true } });
        return NextResponse.json(deals);
    } catch (err) {
        return handlePrismaError(err);
    }
}

export async function POST(req: NextRequest) {
    try {
        const raw = await req.json();
        const parsed = parseBody(createDealSchema, raw);
        if (parsed.success === false) return parsed.response;
        const data = { ...parsed.data };
        if (typeof data.propertyValue === 'number' && typeof data.loanAmount === 'number') {
            (data as Record<string, unknown>).ltv = (data.loanAmount / data.propertyValue) * 100;
        }
        const deal = await prisma.deal.create({ data });
        await logAudit('Deal', deal.id, 'CREATE');
        return NextResponse.json(deal, { status: 201 });
    } catch (err) {
        return handlePrismaError(err);
    }
}
