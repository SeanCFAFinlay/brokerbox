/**
 * BrokerBox Financial Calculations
 * Core mortgage math for private lending, holdback reserves, and debt service ratios.
 */

// ─── Interest Holdback ───────────────────────────────────────────────

/**
 * Calculate the interest holdback (pre-paid interest reserve) for private deals.
 *
 * @param loanAmount  - Principal loan amount ($)
 * @param rate        - Annual interest rate as percentage (e.g. 8.5 for 8.5%)
 * @param months      - Number of months to reserve
 */
export function calculateHoldback(
  loanAmount: number,
  rate: number,
  months: number
): { monthlyInterest: number; totalHoldback: number; effectiveProceeds: number } {
  if (loanAmount <= 0 || rate <= 0 || months <= 0) {
    return { monthlyInterest: 0, totalHoldback: 0, effectiveProceeds: loanAmount };
  }

  const monthlyRate = rate / 100 / 12;
  const monthlyInterest = loanAmount * monthlyRate;
  const totalHoldback = monthlyInterest * months;
  const effectiveProceeds = loanAmount - totalHoldback;

  return {
    monthlyInterest: Math.round(monthlyInterest * 100) / 100,
    totalHoldback: Math.round(totalHoldback * 100) / 100,
    effectiveProceeds: Math.round(effectiveProceeds * 100) / 100,
  };
}

/**
 * Convenience: 6-month interest reserve for standard private mortgage commitments.
 */
export function holdback6Month(loanAmount: number, rate: number) {
  return calculateHoldback(loanAmount, rate, 6);
}

/**
 * Convenience: 12-month interest reserve for extended private mortgage commitments.
 */
export function holdback12Month(loanAmount: number, rate: number) {
  return calculateHoldback(loanAmount, rate, 12);
}

/**
 * Generate a full holdback comparison table for a deal.
 */
export function holdbackComparison(loanAmount: number, rate: number) {
  return {
    threeMonth: calculateHoldback(loanAmount, rate, 3),
    sixMonth: calculateHoldback(loanAmount, rate, 6),
    nineMonth: calculateHoldback(loanAmount, rate, 9),
    twelveMonth: calculateHoldback(loanAmount, rate, 12),
  };
}

// ─── LTV / Debt Ratios ──────────────────────────────────────────────

export function calculateLtv(loanAmount: number, propertyValue: number): number | null {
  if (propertyValue <= 0 || loanAmount < 0) return null;
  return (loanAmount / propertyValue) * 100;
}

export function calculateGds(monthlyHousing: number, grossMonthlyIncome: number): number | null {
  if (grossMonthlyIncome <= 0) return null;
  return (monthlyHousing / grossMonthlyIncome) * 100;
}

export function calculateTds(monthlyHousing: number, otherDebts: number, grossMonthlyIncome: number): number | null {
  if (grossMonthlyIncome <= 0) return null;
  return ((monthlyHousing + otherDebts) / grossMonthlyIncome) * 100;
}
