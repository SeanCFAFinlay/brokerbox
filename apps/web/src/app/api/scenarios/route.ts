export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
    const borrowerId = req.nextUrl.searchParams.get('borrowerId');
    const where = borrowerId ? { borrowerId } : {};
    const scenarios = await prisma.scenario.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(scenarios);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const scenario = await prisma.scenario.create({ data: body });
    await logAudit('Scenario', scenario.id, 'CREATE');
    return NextResponse.json(scenario, { status: 201 });
}
