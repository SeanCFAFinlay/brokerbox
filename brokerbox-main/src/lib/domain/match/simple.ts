/**
 * Simple per-lender match (deal + borrower shape, one lender). Used by API and lightweight callers.
 */

import type { DealWithBorrowerForMatch, LenderForMatch, SimpleMatchResult } from './types';

export function runMatchDealLender(
  deal: DealWithBorrowerForMatch,
  lender: LenderForMatch
): SimpleMatchResult {
  const failures: string[] = [];
  let score = 0;

  if (deal.borrower == null || deal.borrower.creditScore == null) {
    failures.push('Borrower or credit score not specified');
  } else if (deal.borrower.creditScore < lender.minCreditScore) {
    failures.push(
      `Credit score ${deal.borrower.creditScore} below lender minimum ${lender.minCreditScore}`
    );
  } else {
    score += 25;
  }

  const canComputeLTV =
    deal.loanAmount != null && deal.propertyValue != null && deal.propertyValue > 0;
  const dealLTV = deal.ltv ?? (canComputeLTV ? (deal.loanAmount! / deal.propertyValue!) * 100 : null);
  if (dealLTV == null) {
    failures.push('LTV cannot be computed: loan amount or property value missing');
  } else if (dealLTV > lender.maxLTV) {
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

  if (deal.propertyType == null || deal.propertyType === '') {
    failures.push('Property type not specified');
  } else if (!lender.propertyTypes.includes(deal.propertyType)) {
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
