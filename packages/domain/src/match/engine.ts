/**
 * Canonical lender match engine: hard eligibility + weighted scoring + explainable results.
 */

import type {
  BorrowerData,
  DealData,
  LenderData,
  MatchResultItem,
} from './types.js';

const WEIGHTS = {
  rateCompetitiveness: 0.30,
  policyFit: 0.20,
  flexibility: 0.15,
  speed: 0.15,
  brokerPreference: 0.10,
  appetite: 0.10,
};

export function runMatch(
  borrower: BorrowerData,
  deal: DealData,
  lenders: LenderData[]
): MatchResultItem[] {
  const results: MatchResultItem[] = [];

  for (const lender of lenders) {
    const failures: string[] = [];

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

    if (deal.loanAmount < lender.minLoan) {
      failures.push(`Loan amount $${deal.loanAmount.toLocaleString()} < min $${lender.minLoan.toLocaleString()}`);
    }
    if (deal.loanAmount > lender.maxLoan) {
      failures.push(`Loan amount $${deal.loanAmount.toLocaleString()} > max $${lender.maxLoan.toLocaleString()}`);
    }
    if (deal.termMonths < lender.termMin || deal.termMonths > lender.termMax) {
      failures.push(`Term ${deal.termMonths} mos outside allowed range ${lender.termMin}-${lender.termMax}`);
    }

    if (!lender.supportedProvinces.includes(borrower.province)) {
      failures.push(`Province ${borrower.province} not supported`);
    }
    if (!lender.propertyTypes.includes(deal.propertyType)) {
      failures.push(`Property type ${deal.propertyType} not supported`);
    }
    if (!lender.positionTypes.includes(deal.position)) {
      failures.push(`Position ${deal.position} not supported`);
    }

    const isRural = borrower.city?.toLowerCase().includes('rural') ?? false;
    if (isRural && deal.ltv > (lender.ruralMaxLTV ?? lender.maxLTV)) {
      failures.push(`Rural LTV ${(deal.ltv || 0).toFixed(1)}% exceeds specific rural max ${lender.ruralMaxLTV ?? lender.maxLTV}%`);
    }

    if (borrower.selfEmployed && !lender.allowsSelfEmployed) {
      failures.push(`Lender does not permit Self-Employed borrowers`);
    }

    if (borrower.creditScore < lender.minCreditScore) {
      const ltvBuffer = lender.maxLTV - deal.ltv;
      if (lender.exceptionsTolerance > 7 && ltvBuffer > 15) {
        const idx = failures.indexOf(`Credit score ${borrower.creditScore} < min ${lender.minCreditScore}`);
        if (idx > -1) {
          failures.splice(idx, 1);
          failures.push(`Credit score exception granted (Low LTV & High Tolerance)`);
        }
      }
    }

    const passed =
      failures.length === 0 || failures.every((f) => f.includes('exception granted'));

    const breakdown: { factor: string; score: number; weight: number; weighted: number }[] = [];

    const rateDiff = Math.max(0, 8 - lender.baseRate - lender.pricingPremium);
    const rateScore = Math.min(100, (rateDiff / 3) * 100);
    breakdown.push({
      factor: 'Rate Competitiveness',
      score: Math.round(rateScore),
      weight: WEIGHTS.rateCompetitiveness,
      weighted: rateScore * WEIGHTS.rateCompetitiveness,
    });

    const ltvMargin = Math.max(0, lender.maxLTV - (deal.ltv || 0));
    const gdsMargin = Math.max(0, lender.maxGDS - (deal.gds || 0));
    const tdsMargin = Math.max(0, lender.maxTDS - (deal.tds || 0));
    const policyScore = Math.min(100, ((ltvMargin + gdsMargin + tdsMargin) / 30) * 100);
    breakdown.push({
      factor: 'Policy Fit',
      score: Math.round(policyScore),
      weight: WEIGHTS.policyFit,
      weighted: policyScore * WEIGHTS.policyFit,
    });

    const speedScore = (lender.speed / 10) * 100;
    breakdown.push({
      factor: 'Speed / Likelihood',
      score: Math.round(speedScore),
      weight: WEIGHTS.speed,
      weighted: speedScore * WEIGHTS.speed,
    });

    const prefScore = 70;
    breakdown.push({
      factor: 'Broker Preference',
      score: prefScore,
      weight: WEIGHTS.brokerPreference,
      weighted: prefScore * WEIGHTS.brokerPreference,
    });

    let flexScore = (lender.exceptionsTolerance / 10) * 100;
    if (lender.allowsSelfEmployed) flexScore = Math.min(100, flexScore + 10);
    breakdown.push({
      factor: 'Underwriting Flexibility',
      score: Math.round(flexScore),
      weight: WEIGHTS.flexibility,
      weighted: flexScore * WEIGHTS.flexibility,
    });

    const appetiteScore = (lender.appetite / 10) * 100;
    breakdown.push({
      factor: 'Lender Appetite',
      score: Math.round(appetiteScore),
      weight: WEIGHTS.appetite,
      weighted: appetiteScore * WEIGHTS.appetite,
    });

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
