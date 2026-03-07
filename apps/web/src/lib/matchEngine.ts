/**
 * BrokerBox Match Engine
 * Rules-based filtering + scoring-based ranking
 */

export interface BorrowerData {
    creditScore: number;
    income: number;
    province: string;
    liabilities: number;
}

export interface DealData {
    propertyValue: number;
    loanAmount: number;
    propertyType: string;
    position: string;
    loanPurpose: string;
    termMonths: number;
    ltv: number;
    gds: number;
    tds: number;
}

export interface LenderData {
    id: string;
    name: string;
    minCreditScore: number;
    maxLTV: number;
    maxGDS: number;
    maxTDS: number;
    supportedProvinces: string[];
    propertyTypes: string[];
    positionTypes: string[];
    minLoan: number;
    maxLoan: number;
    termMin: number;
    termMax: number;
    baseRate: number;
    speed: number;
    exceptionsTolerance: number;
    appetite: number;
    pricingPremium: number;
    documentRequirements: string[];
}

export interface MatchResult {
    lenderId: string;
    lenderName: string;
    score: number;
    passed: boolean;
    failures: string[];
    breakdown: { factor: string; score: number; weight: number; weighted: number }[];
    requiredDocs: string[];
    effectiveRate: number;
}

const WEIGHTS = {
    rateCompetitiveness: 0.25,
    policyFit: 0.20,
    speed: 0.15,
    brokerPreference: 0.10,
    exceptionsTolerance: 0.15,
    appetite: 0.15,
};

export function runMatch(borrower: BorrowerData, deal: DealData, lenders: LenderData[]): MatchResult[] {
    const results: MatchResult[] = [];

    for (const lender of lenders) {
        const failures: string[] = [];

        // Gating rules - Credit & Ratios
        if (borrower.creditScore < lender.minCreditScore) {
            failures.push(`Credit score ${borrower.creditScore} < min ${lender.minCreditScore}`);
        }
        if (deal.ltv > lender.maxLTV) {
            failures.push(`LTV ${(deal.ltv || 0).toFixed(1)}% > max ${lender.maxLTV}%`);
        }
        if (deal.gds > lender.maxGDS) {
            failures.push(`GDS ${(deal.gds || 0).toFixed(1)}% > max ${lender.maxGDS}%`);
        }
        if (deal.tds > lender.maxTDS) {
            failures.push(`TDS ${(deal.tds || 0).toFixed(1)}% > max ${lender.maxTDS}%`);
        }

        // Gating rules - Loan Size & Term
        if (deal.loanAmount < lender.minLoan) {
            failures.push(`Loan amount $${deal.loanAmount.toLocaleString()} < min $${lender.minLoan.toLocaleString()}`);
        }
        if (deal.loanAmount > lender.maxLoan) {
            failures.push(`Loan amount $${deal.loanAmount.toLocaleString()} > max $${lender.maxLoan.toLocaleString()}`);
        }
        if (deal.termMonths < lender.termMin || deal.termMonths > lender.termMax) {
            failures.push(`Term ${deal.termMonths} mos outside allowed range ${lender.termMin}-${lender.termMax}`);
        }

        // Gating rules - Types & Position
        if (!lender.supportedProvinces.includes(borrower.province)) {
            failures.push(`Province ${borrower.province} not supported`);
        }
        if (!lender.propertyTypes.includes(deal.propertyType)) {
            failures.push(`Property type ${deal.propertyType} not supported`);
        }
        if (!lender.positionTypes.includes(deal.position)) {
            failures.push(`Position ${deal.position} not supported`);
        }

        const passed = failures.length === 0;

        // Scoring (even if failed gating, so broker can see how close)
        const breakdown: { factor: string; score: number; weight: number; weighted: number }[] = [];

        // Rate competitiveness: lower rate = higher score
        const rateDiff = Math.max(0, 8 - lender.baseRate - lender.pricingPremium);
        const rateScore = Math.min(100, (rateDiff / 3) * 100);
        breakdown.push({ factor: 'Rate Competitiveness', score: Math.round(rateScore), weight: WEIGHTS.rateCompetitiveness, weighted: rateScore * WEIGHTS.rateCompetitiveness });

        // Policy fit: how much headroom in LTV/GDS/TDS
        const ltvMargin = Math.max(0, lender.maxLTV - (deal.ltv || 0));
        const gdsMargin = Math.max(0, lender.maxGDS - (deal.gds || 0));
        const tdsMargin = Math.max(0, lender.maxTDS - (deal.tds || 0));
        const policyScore = Math.min(100, ((ltvMargin + gdsMargin + tdsMargin) / 30) * 100);
        breakdown.push({ factor: 'Policy Fit', score: Math.round(policyScore), weight: WEIGHTS.policyFit, weighted: policyScore * WEIGHTS.policyFit });

        // Speed
        const speedScore = (lender.speed / 10) * 100;
        breakdown.push({ factor: 'Speed / Likelihood', score: Math.round(speedScore), weight: WEIGHTS.speed, weighted: speedScore * WEIGHTS.speed });

        // Broker preference (default 70)
        const prefScore = 70;
        breakdown.push({ factor: 'Broker Preference', score: prefScore, weight: WEIGHTS.brokerPreference, weighted: prefScore * WEIGHTS.brokerPreference });

        // Exceptions tolerance
        const exceptScore = (lender.exceptionsTolerance / 10) * 100;
        breakdown.push({ factor: 'Exceptions Tolerance', score: Math.round(exceptScore), weight: WEIGHTS.exceptionsTolerance, weighted: exceptScore * WEIGHTS.exceptionsTolerance });

        // Appetite
        const appetiteScore = (lender.appetite / 10) * 100;
        breakdown.push({ factor: 'Lender Appetite', score: Math.round(appetiteScore), weight: WEIGHTS.appetite, weighted: appetiteScore * WEIGHTS.appetite });

        const totalScore = Math.round(breakdown.reduce((sum, b) => sum + b.weighted, 0));

        results.push({
            lenderId: lender.id,
            lenderName: lender.name,
            score: totalScore,
            passed,
            failures,
            breakdown,
            requiredDocs: lender.documentRequirements,
            effectiveRate: lender.baseRate + lender.pricingPremium,
        });
    }

    return results.sort((a, b) => {
        if (a.passed && !b.passed) return -1;
        if (!a.passed && b.passed) return 1;
        return b.score - a.score;
    });
}
