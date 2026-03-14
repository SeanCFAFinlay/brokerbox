/**
 * Financial Module
 * calculator.ts
 * Core logic for Mortgage Math calculations
 */

export function calculateCommissionSplit(
  loanAmount: number,
  bps: number,
  splitPercentage: number,
  flatFees: number = 0
): { gross: number; brokerNet: number; brokerageNet: number } {
  const gross = loanAmount * (bps / 10000);
  const brokerageNet = gross * (splitPercentage / 100);
  const brokerNet = gross - brokerageNet - flatFees;

  return { gross, brokerNet, brokerageNet };
}
