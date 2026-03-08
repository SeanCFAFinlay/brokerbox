import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
    const body = await req.json();

    const amount = Number(body.amount);
    if (!amount || amount <= 0) {
        return NextResponse.json({ error: 'Valid investment amount is required' }, { status: 400 });
    }

    const pool = await prisma.capitalPool.findUnique({ where: { id: body.poolId } });
    if (!pool) return NextResponse.json({ error: 'Pool not found' }, { status: 404 });

    const inv = await prisma.investment.create({
        data: {
            amount,
            yield: Number(body.yield) || pool.targetYield,
            poolId: body.poolId,
            userId: body.userId,
            status: 'active'
        }
    });

    // Update pool availability mapping (adding an investment doesn't change pool target size, just tracking who provided it)
    await logAudit('Investment', inv.id, 'CREATE');

    return NextResponse.json(inv, { status: 201 });
}
