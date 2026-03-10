/**
 * Simple per-lender match (deal + borrower shape, one lender). Used by API and lightweight callers.
 */

import type { DealWithBorrowerForMatch, LenderForMatch, SimpleMatchResult } from './types.js';

export function runMatchDealLender(
  deal: DealWithBorrowerForMatch,
  lender: LenderForMatch
): SimpleMatchResult {
  const failures: string[] = [];
  let score = 0;

  if (deal.borrower?.creditScore != null && deal.borrower.creditScore < lender.minCreditScore) {
    failures.push(
      `Credit score ${deal.borrower.creditScore} below lender minimum ${lender.minCreditScore}`
    );
  } else {
    score += 25;
  }

  const dealLTV =
    deal.ltv ??
    (deal.loanAmount != null && deal.propertyValue != null && deal.propertyValue > 0
      ? (deal.loanAmount / deal.propertyValue) * 100
      : 0);
  if (dealLTV > lender.maxLTV) {
    failures.push(`LTV ${dealLTV.toFixed(2)}% exceeds lender maximum ${lender.maxLTV}%`);
  } else {
    score += 25;
  }

  if (deal.loanAmount != null) {
    if (deal.loanAmount < lender.minLoan) {
      failures.push(`Loan amount ${deal.loanAmount} below lender minimum ${lender.minLoan}`);
    } else if (deal.loanAmount > lender.maxLoan) {
      failures.push(`Loan amount ${deal.loanAmount} exceeds lender maximum ${lender.maxLoan}`);
    } else {
      score += 25;
    }
  }

  if (deal.propertyType != null && !lender.propertyTypes.includes(deal.propertyType)) {
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
