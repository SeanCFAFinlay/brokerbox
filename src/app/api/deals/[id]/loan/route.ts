import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    const deal = await prisma.deal.findUnique({
        where: { id },
        include: { lender: true }
    });
    if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 });

    // Ensure we don't accidentally fund twice
    const existingLoan = await prisma.loan.findUnique({ where: { dealId: id } });
    if (existingLoan) return NextResponse.json({ error: 'Loan already exists' }, { status: 400 });

    const principal = Number(body.principalBalance) || deal.loanAmount;
    const poolId = body.poolId;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the Loan record
            const newLoan = await tx.loan.create({
                data: {
                    dealId: id,
                    poolId: poolId || null,
                    status: 'active',
                    fundedDate: new Date(body.fundedDate || Date.now()),
                    maturityDate: new Date(body.maturityDate),
                    principalBalance: principal,
                    interestRate: Number(body.interestRate) || deal.interestRate || 0,
                    interestType: body.interestType || 'fixed'
                }
            });

            // 2. Update Deal stage
            await tx.deal.update({
                where: { id },
                data: { stage: 'funded' }
            });

            // 3. If a capital pool is used, deduct the principal
            if (poolId) {
                const pool = await tx.capitalPool.findUnique({ where: { id: poolId } });
                if (pool) {
                    const newAvailable = pool.availableAmount - principal;
                    await tx.capitalPool.update({
                        where: { id: poolId },
                        data: {
                            availableAmount: newAvailable,
                            utilizationRate: ((pool.totalAmount - newAvailable) / pool.totalAmount) * 100
                        }
                    });

                    // 4. Update Lender total capitalAvailable (sum of pools)
                    const lenderPools = await tx.capitalPool.findMany({
                        where: { lenderId: pool.lenderId }
                    });
                    const totalLenderAvailable = lenderPools.reduce((sum, p) =>
                        p.id === poolId ? sum + newAvailable : sum + p.availableAmount, 0);

                    await tx.lender.update({
                        where: { id: pool.lenderId },
                        data: { capitalAvailable: totalLenderAvailable }
                    });
                }
            } else if (deal.lenderId) {
                // If no specific pool, just update the lender's general capital available if applicable
                await tx.lender.update({
                    where: { id: deal.lenderId },
                    data: { capitalAvailable: { decrement: principal } }
                });
            }

            return newLoan;
        });

        await logAudit('Loan', result.id, 'CREATE', undefined, { transactional: true });
        await logAudit('Deal', id, 'STATUS_CHANGE', { stage: { old: deal.stage as string, new: 'funded' } });

        // Add to stage history
        await prisma.dealStageHistory.create({
            data: {
                dealId: id,
                fromStage: deal.stage,
                toStage: 'funded',
                changedBy: 'broker'
            }
        });

        // Auto-sync to Outlook if enabled
        try {
            const { syncToOutlook } = await import('@/lib/outlook');
            await syncToOutlook('demo');
        } catch (e) {
            console.error('Outlook sync failed:', e);
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        console.error('Funding Transaction Failed:', error);
        return NextResponse.json({ error: error.message || 'Funding failed' }, { status: 500 });
    }
}
