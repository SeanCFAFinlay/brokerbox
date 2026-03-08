export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { runMatch } from '@/lib/matchEngine';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
    const { borrowerId, dealId } = await req.json();

    const borrower = await prisma.borrower.findUnique({ where: { id: borrowerId } });
    if (!borrower) return NextResponse.json({ error: 'Borrower not found' }, { status: 404 });

    let deal;
    if (dealId) {
        deal = await prisma.deal.findUnique({ where: { id: dealId } });
    } else {
        deal = await prisma.deal.findFirst({ where: { borrowerId }, orderBy: { updatedAt: 'desc' } });
    }

    if (!deal) return NextResponse.json({ error: 'No deal found for this borrower' }, { status: 404 });

    const lenders = await prisma.lender.findMany({ where: { status: 'active' } });

    const ltv = deal.ltv ?? (deal.propertyValue > 0 ? (deal.loanAmount / deal.propertyValue) * 100 : 80);
    const monthlyIncome = borrower.income / 12;
    const monthlyPayment = deal.monthlyPayment ?? (deal.loanAmount * 0.005);
    const gds = deal.gds ?? (monthlyIncome > 0 ? (monthlyPayment / monthlyIncome) * 100 : 30);
    const tds = deal.tds ?? (monthlyIncome > 0 ? ((monthlyPayment + borrower.liabilities * 0.03) / monthlyIncome) * 100 : 40);

    const results = runMatch(
        {
            creditScore: borrower.creditScore,
            income: borrower.income,
            province: borrower.province,
            city: borrower.city,
            liabilities: borrower.liabilities,
        },
        {
            propertyValue: deal.propertyValue,
            loanAmount: deal.loanAmount,
            propertyType: deal.propertyType,
            position: deal.position,
            loanPurpose: deal.loanPurpose,
            termMonths: deal.termMonths,
            ltv,
            gds,
            tds,
        },
        lenders.map((l: any) => ({
            id: l.id,
            name: l.name,
            minCreditScore: l.minCreditScore,
            maxLTV: l.maxLTV,
            maxGDS: l.maxGDS,
            maxTDS: l.maxTDS,
            supportedProvinces: l.supportedProvinces,
            propertyTypes: l.propertyTypes,
            positionTypes: l.positionTypes,
            minLoan: l.minLoan,
            maxLoan: l.maxLoan,
            termMin: l.termMin,
            termMax: l.termMax,
            baseRate: l.baseRate,
            speed: l.speed,
            exceptionsTolerance: l.exceptionsTolerance,
            appetite: l.appetite,
            pricingPremium: l.pricingPremium,
            documentRequirements: l.documentRequirements,
            allowsSelfEmployed: l.allowsSelfEmployed ?? true,
            ruralMaxLTV: l.ruralMaxLTV ?? l.maxLTV,
        }))
    );

    const { applyToDeal, selectedLenderId } = await req.json().catch(() => ({}));
    if (applyToDeal && dealId) {
        const topMatch = results[0];
        const updateData: any = {
            matchScore: topMatch?.score || 0
        };
        if (selectedLenderId) {
            updateData.lenderId = selectedLenderId;
            const specificMatch = results.find(r => r.lenderId === selectedLenderId);
            if (specificMatch) {
                updateData.matchScore = specificMatch.score;
                updateData.stage = 'matched';
            }
        }
        await prisma.deal.update({
            where: { id: dealId },
            data: updateData
        });
        await logAudit('Deal', dealId, 'UPDATE', { match: { old: deal.lenderId, new: selectedLenderId } });
    }

    return NextResponse.json({ borrower, deal, results });
}
