export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
    const borrowerId = req.nextUrl.searchParams.get('borrowerId');
    const dealId = req.nextUrl.searchParams.get('dealId');

    const where: any = {};
    if (borrowerId) where.borrowerId = borrowerId;
    if (dealId) where.dealId = dealId;

    const scenarios = await prisma.scenario.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { deal: { select: { id: true, propertyAddress: true, loanAmount: true, loanPurpose: true } } }
    });
    return NextResponse.json(scenarios);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const scenario = await prisma.scenario.create({ data: body });
    await logAudit('Scenario', scenario.id, 'CREATE');
    return NextResponse.json(scenario, { status: 201 });
}
