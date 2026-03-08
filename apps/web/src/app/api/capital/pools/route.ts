import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
    const pools = await prisma.capitalPool.findMany({
        include: {
            lender: true,
            investments: { include: { user: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(pools);
}

export async function POST(req: NextRequest) {
    const body = await req.json();

    // Convert to numbers
    const totalAmount = Number(body.totalAmount);

    const pool = await prisma.capitalPool.create({
        data: {
            name: body.name,
            totalAmount,
            availableAmount: totalAmount, // Initially, available = total
            minInvestment: Number(body.minInvestment) || 50000,
            targetYield: Number(body.targetYield) || 8.0,
            lenderId: body.lenderId,
        }
    });

    await logAudit('CapitalPool', pool.id, 'CREATE');

    // Also update the lender's capitalAvailable manually to sum up their pools
    const allPools = await prisma.capitalPool.findMany({ where: { lenderId: body.lenderId } });
    const newCapital = allPools.reduce((sum, p) => sum + p.availableAmount, 0);
    await prisma.lender.update({ where: { id: body.lenderId }, data: { capitalAvailable: newCapital } });

    return NextResponse.json(pool, { status: 201 });
}
