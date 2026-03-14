// MortgageMath.ts
// Core financial engine utilities for BrokerBox

export function calculateGDS(
  principalAndInterest: number,
  propertyTaxes: number,
  heatingCosts: number,
  condoFees: number,
  grossIncome: number
): number {
  if (grossIncome <= 0) return 0;
  return ((principalAndInterest + propertyTaxes + heatingCosts + (condoFees * 0.5)) / grossIncome) * 100;
}

export function calculateTDS(
  gdsComponentsTotal: number,
  otherDebts: number,
  grossIncome: number
): number {
  if (grossIncome <= 0) return 0;
  return ((gdsComponentsTotal + otherDebts) / grossIncome) * 100;
}

/**
 * Calculate private commission.
 * @param loanAmount Total loan amount
 * @param bps Basis points (e.g., 100 bps = 1%)
 * @param splitPercentage The split going back to the house/brokerage (e.g., 20 for 20%)
 * @param flatFees Any flat fees deducted
 */
export function calculatePrivateCommission(
  loanAmount: number,
  bps: number,
  splitPercentage: number,
  flatFees: number
): number {
  const grossCommission = loanAmount * (bps / 10000);
  const splitAmount = grossCommission * (splitPercentage / 100);
  return grossCommission - splitAmount - flatFees;
}

export interface AmortizationPeriod {
  month: number;
  principalPayment: number;
  interestPayment: number;
  balance: number;
  totalPayment: number;
}

export function calculateAmortization(
  principal: number,
  annualInterestRate: number,
  amortizationMonths: number,
  isInterestOnly: boolean = false
): AmortizationPeriod[] {
  const schedule: AmortizationPeriod[] = [];
  let balance = principal;
  
  // Standard monthly compounding
  const monthlyInterestRate = annualInterestRate / 100 / 12;

  if (isInterestOnly) {
    const interestPayment = balance * monthlyInterestRate;
    for (let month = 1; month <= amortizationMonths; month++) {
      schedule.push({
        month,
        principalPayment: 0,
        interestPayment,
        balance,
        totalPayment: interestPayment,
      });
    }
  } else {
    // Principal and Interest standard amortization
    // Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n - 1]
    const monthlyPayment =
      (principal * monthlyInterestRate) /
      (1 - Math.pow(1 + monthlyInterestRate, -amortizationMonths));

    for (let month = 1; month <= amortizationMonths; month++) {
      const interestPayment = balance * monthlyInterestRate;
      let principalPayment = monthlyPayment - interestPayment;
      
      // Handle rounding issues on the final payment
      if (balance - principalPayment < 0.01 || month === amortizationMonths) {
        principalPayment = balance;
      }
      
      balance = Math.max(0, balance - principalPayment);
      
      schedule.push({
        month,
        principalPayment,
        interestPayment,
        balance,
        totalPayment: principalPayment + interestPayment,
      });
    }
  }
  
  return schedule;
}
