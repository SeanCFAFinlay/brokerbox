import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { runMatch } from '@/lib/domain';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
    try {
        const { borrowerId, dealId } = await req.json();

        const { data: borrower, error: borrowerError } = await supabase.from('Borrower').select('*').eq('id', borrowerId).single();
        if (borrowerError || !borrower) return NextResponse.json({ error: 'Borrower not found' }, { status: 404 });

        let deal;
        if (dealId) {
            const { data: dealData } = await supabase.from('Deal').select('*').eq('id', dealId).single();
            deal = dealData;
        } else {
            const { data: dealData } = await supabase.from('Deal').select('*').eq('borrowerId', borrowerId).order('updatedAt', { ascending: false }).limit(1).single();
            deal = dealData;
        }

        if (!deal) return NextResponse.json({ error: 'No deal found for this borrower' }, { status: 404 });

        const { data: lenders } = await supabase.from('Lender').select('*').eq('status', 'active');
        if (!lenders) return NextResponse.json({ error: 'No active lenders found' }, { status: 500 });

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

        const { applyToDeal, selectedLenderId } = await req.clone().json().catch(() => ({}));

        // Step 1: Create a MatchRun record
        const { data: matchRun, error: matchRunError } = await supabase.from('MatchRun').insert({ dealId: deal.id }).select().single();
        if (matchRunError) throw matchRunError;

        // Step 2: Persist Match results as snapshots
        await supabase.from('LenderMatchSnapshot').insert(
            results.map(r => ({
                dealId: deal.id,
                matchRunId: matchRun.id,
                lenderId: r.lenderId,
                score: r.score,
                passed: r.passed,
                failures: r.failures,
                snapshot: lenders.find(l => l.id === r.lenderId) as any
            }))
        );

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
            await supabase.from('Deal').update(updateData).eq('id', dealId);
            await logAudit('Deal', dealId, 'MATCH_APPLIED', { lenderId: selectedLenderId }, { matchRunId: matchRun.id }, 'Broker');
        }

        return NextResponse.json({ borrower, deal, results, matchRunId: matchRun.id });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Match failed' }, { status: 500 });
    }
}
