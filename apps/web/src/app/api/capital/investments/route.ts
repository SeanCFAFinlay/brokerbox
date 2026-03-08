import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
    const body = await req.json();

    const amount = Number(body.amount);
    if (!amount || amount <= 0) {
        return NextResponse.json({ error: 'Valid investment amount is required' }, { status: 400 });
    }

    // Use a transaction to ensure pool totals are updated atomically
    const inv = await prisma.$transaction(async (tx) => {
        const pool = await tx.capitalPool.findUnique({ where: { id: body.poolId } });
        if (!pool) throw new Error('Pool not found');

        const newInvestment = await tx.investment.create({
            data: {
                amount,
                yield: Number(body.yield) || pool.targetYield,
                poolId: body.poolId,
                userId: body.userId,
                status: 'active'
            }
        });

        // Adding an investment increases both total capacity and currently available dry powder
        const newTotal = pool.totalAmount + amount;
        const newAvailable = pool.availableAmount + amount;
        const newUtilization = ((newTotal - newAvailable) / (newTotal || 1)) * 100;

        await tx.capitalPool.update({
            where: { id: body.poolId },
            data: {
                totalAmount: newTotal,
                availableAmount: newAvailable,
                utilizationRate: newUtilization
            }
        });

        // Also update the lender's total capital available summary
        await tx.lender.update({
            where: { id: pool.lenderId },
            data: {
                capitalAvailable: { increment: amount }
            }
        });

        return newInvestment;
    });

    await logAudit('Investment', (inv as any).id, 'CREATE', undefined, { amount });

    return NextResponse.json(inv, { status: 201 });
}
