import { Deal, Lender } from '@brokerbox/database';

export interface MatchResult {
    lenderId: string;
    score: number;
    passed: boolean;
    failures: string[];
}

export function runMatch(deal: Partial<Deal>, lender: Lender): MatchResult {
    const failures: string[] = [];
    let score = 0;

    // 1. Credit Score Check
    if (deal.borrower?.creditScore && deal.borrower.creditScore < lender.minCreditScore) {
        failures.push(`Credit score ${deal.borrower.creditScore} below lender minimum ${lender.minCreditScore}`);
    } else {
        score += 25;
    }

    // 2. LTV Check
    const dealLTV = deal.ltv || (deal.loanAmount && deal.propertyValue ? (deal.loanAmount / deal.propertyValue) * 100 : 0);
    if (dealLTV > lender.maxLTV) {
        failures.push(`LTV ${dealLTV.toFixed(2)}% exceeds lender maximum ${lender.maxLTV}%`);
    } else {
        score += 25;
    }

    // 3. Loan Amount Check
    if (deal.loanAmount) {
        if (deal.loanAmount < lender.minLoan) {
            failures.push(`Loan amount ${deal.loanAmount} below lender minimum ${lender.minLoan}`);
        } else if (deal.loanAmount > lender.maxLoan) {
            failures.push(`Loan amount ${deal.loanAmount} exceeds lender maximum ${lender.maxLoan}`);
        } else {
            score += 25;
        }
    }

    // 4. Property Type Check
    if (deal.propertyType && !lender.propertyTypes.includes(deal.propertyType)) {
        failures.push(`Property type ${deal.propertyType} not supported by lender`);
    } else {
        score += 25;
    }

    return {
        lenderId: lender.id,
        score,
        passed: failures.length === 0,
        failures,
    };
}
