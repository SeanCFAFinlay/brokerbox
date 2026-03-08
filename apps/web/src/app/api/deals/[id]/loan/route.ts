import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    const deal = await prisma.deal.findUnique({ where: { id } });
    if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 });

    // Ensure we don't accidentally fund twice
    const existingLoan = await prisma.loan.findUnique({ where: { dealId: id } });
    if (existingLoan) return NextResponse.json({ error: 'Loan already exists' }, { status: 400 });

    const loan = await prisma.loan.create({
        data: {
            dealId: id,
            status: 'active',
            fundedDate: new Date(body.fundedDate || Date.now()),
            maturityDate: new Date(body.maturityDate),
            principalBalance: Number(body.principalBalance) || deal.loanAmount,
            interestRate: Number(body.interestRate) || deal.interestRate,
            interestType: body.interestType || 'fixed'
        }
    });

    // Automatically move deal to funded
    await prisma.deal.update({
        where: { id },
        data: { stage: 'funded' }
    });

    // Correctly structured audit log
    await logAudit('Loan', loan.id, 'CREATE');
    await logAudit('Deal', id, 'UPDATE', { stage: { old: deal.stage as string, new: 'funded' } });

    return NextResponse.json(loan, { status: 201 });
}
