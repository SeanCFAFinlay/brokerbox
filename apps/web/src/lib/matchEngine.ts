/**
 * BrokerBox Match Engine
 * Rules-based filtering + scoring-based ranking
 */

export interface BorrowerData {
    creditScore: number;
    income: number;
    province: string;
    city: string; // added city for rural/urban analysis
    liabilities: number;
    selfEmployed?: boolean; // added self-employed flag
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
    allowsSelfEmployed: boolean; // added check
    ruralMaxLTV: number; // specific rule for rural properties
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
    rateCompetitiveness: 0.30,
    policyFit: 0.20,
    flexibility: 0.15,
    speed: 0.15,
    brokerPreference: 0.10,
    appetite: 0.10,
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

        // Granular Gating - Rural properties
        const isRural = borrower.city?.toLowerCase().includes('rural') || false; // Simple heuristic for now
        if (isRural && (deal.ltv > (lender.ruralMaxLTV || lender.maxLTV))) {
            failures.push(`Rural LTV ${(deal.ltv || 0).toFixed(1)}% exceeds specific rural max ${lender.ruralMaxLTV || lender.maxLTV}%`);
        }

        // Granular Gating - Self Employed
        if (borrower.selfEmployed && !lender.allowsSelfEmployed) {
            failures.push(`Lender does not permit Self-Employed borrowers`);
        }

        // Lenient Credit check if low LTV and high exception tolerance
        if (borrower.creditScore < lender.minCreditScore) {
            const ltvBuffer = lender.maxLTV - deal.ltv;
            if (lender.exceptionsTolerance > 7 && ltvBuffer > 15) {
                // Exception logic: they waive the credit score rule if LTV is extremely low
                const idx = failures.indexOf(`Credit score ${borrower.creditScore} < min ${lender.minCreditScore}`);
                if (idx > -1) {
                    failures.splice(idx, 1);
                    failures.push(`Credit score exception granted (Low LTV & High Tolerance)`);
                }
            }
        }

        const passed = failures.length === 0 || failures.every(f => f.includes('exception granted'));

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

        // Flexibility (Exceptions Tolerance + Self Employed Allowance)
        let flexScore = (lender.exceptionsTolerance / 10) * 100;
        if (lender.allowsSelfEmployed) flexScore = Math.min(100, flexScore + 10);
        breakdown.push({ factor: 'Underwriting Flexibility', score: Math.round(flexScore), weight: WEIGHTS.flexibility, weighted: flexScore * WEIGHTS.flexibility });

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
