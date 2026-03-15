/**
 * BrokerBox Private Mortgage Math Engine
 * Interest holdback reserves, amortization, and private lending calculations.
 */

// ─── Interest Holdback (Pre-paid Reserve) ────────────────────────────

/**
 * Calculate the interest holdback for a private mortgage commitment.
 *
 * Private lenders deduct a pre-paid interest reserve from the advance.
 * This function returns the reserve, monthly interest, and net proceeds.
 *
 * @param loanAmount - Principal ($)
 * @param annualRate - Annual interest rate as % (e.g. 9.5 for 9.5%)
 * @param months     - Months to reserve (typically 6 or 12)
 */
export function interestHoldback(
  loanAmount: number,
  annualRate: number,
  months: number
) {
  if (loanAmount <= 0 || annualRate <= 0 || months <= 0) {
    return { monthlyInterest: 0, reserve: 0, netAdvance: loanAmount };
  }
  const monthlyRate = annualRate / 100 / 12;
  const monthlyInterest = round(loanAmount * monthlyRate);
  const reserve = round(monthlyInterest * months);
  const netAdvance = round(loanAmount - reserve);

  return { monthlyInterest, reserve, netAdvance };
}

/** Convenience: 6-month holdback */
export function holdback6(loanAmount: number, rate: number) {
  return interestHoldback(loanAmount, rate, 6);
}

/** Convenience: 12-month holdback */
export function holdback12(loanAmount: number, rate: number) {
  return interestHoldback(loanAmount, rate, 12);
}

/** Side-by-side comparison of 3/6/9/12 month reserves */
export function holdbackComparison(loanAmount: number, rate: number) {
  return {
    three: interestHoldback(loanAmount, rate, 3),
    six: interestHoldback(loanAmount, rate, 6),
    nine: interestHoldback(loanAmount, rate, 9),
    twelve: interestHoldback(loanAmount, rate, 12),
  };
}

// ─── Lender Fee Stack ────────────────────────────────────────────────

/**
 * Calculate the total fee stack for a private mortgage.
 *
 * @param loanAmount   - Principal ($)
 * @param lenderFeePct - Lender fee as % of principal (e.g. 2.0)
 * @param brokerFeePct - Broker fee as % of principal (e.g. 1.5)
 * @param adminFee     - Flat admin/legal fee ($)
 */
export function feeStack(
  loanAmount: number,
  lenderFeePct: number,
  brokerFeePct: number,
  adminFee: number = 0
) {
  const lenderFee = round(loanAmount * (lenderFeePct / 100));
  const brokerFee = round(loanAmount * (brokerFeePct / 100));
  const totalFees = lenderFee + brokerFee + adminFee;
  const netToLender = round(loanAmount - totalFees);

  return { lenderFee, brokerFee, adminFee, totalFees, netToLender };
}

// ─── Monthly Payment (Interest-Only) ─────────────────────────────────

/** Interest-only monthly payment for private mortgages */
export function interestOnlyPayment(loanAmount: number, annualRate: number) {
  if (loanAmount <= 0 || annualRate <= 0) return 0;
  return round(loanAmount * (annualRate / 100 / 12));
}

// ─── LTV ─────────────────────────────────────────────────────────────

export function calculateLtv(loanAmount: number, propertyValue: number): number | null {
  if (propertyValue <= 0 || loanAmount < 0) return null;
  return round((loanAmount / propertyValue) * 100);
}

// ─── Helpers ─────────────────────────────────────────────────────────

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
