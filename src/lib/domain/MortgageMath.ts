/**
 * MortgageMath.ts
 * Core financial engine for BrokerBox CRM.
 */

export interface GdsTdsInput {
    principal: number;
    interest: number;
    taxes: number;
    heat: number;
    condoFees?: number;
    otherDebt?: number;
    grossIncome: number;
}

export function calculateGDS(input: GdsTdsInput): number {
    const housingCosts = input.principal + input.interest + input.taxes + input.heat + (input.condoFees || 0) * 0.5;
    return (housingCosts / (input.grossIncome / 12)) * 100;
}

export function calculateTDS(input: GdsTdsInput): number {
    const totalDebt = input.principal + input.interest + input.taxes + input.heat + (input.condoFees || 0) * 0.5 + (input.otherDebt || 0);
    return (totalDebt / (input.grossIncome / 12)) * 100;
}

export interface CommissionSplit {
    loanAmount: number;
    lenderBps: number;
    brokerBps: number;
    flatFees: number;
    splitPercentage: number;
}

export function calculateCommission(input: CommissionSplit) {
    const lenderFee = (input.loanAmount * input.lenderBps) / 10000;
    const brokerFee = (input.loanAmount * input.brokerBps) / 10000;
    const totalGross = lenderFee + brokerFee + input.flatFees;
    const houseSplit = totalGross * (input.splitPercentage / 100);
    const agentSplit = totalGross - houseSplit;

    return { totalGross, houseSplit, agentSplit };
}

export function calculateLTV(loanAmount: number, propertyValue: number): number {
    if (propertyValue === 0) return 0;
    return (loanAmount / propertyValue) * 100;
}

export function calculateLenderROI(input: {
    loanAmount: number,
    interestRate: number,
    lenderFee: number,
    termMonths: number,
    servicingFee: number
}) {
    const termInterest = (input.loanAmount * (input.interestRate / 100)) * (input.termMonths / 12);
    const lenderFeeAmount = (input.loanAmount * (input.lenderFee / 100));
    const totalIncome = termInterest + lenderFeeAmount - (input.loanAmount * (input.servicingFee / 100) * (input.termMonths / 12));
    const roi = (totalIncome / input.loanAmount) * (12 / input.termMonths) * 100;
    
    return { roi, totalIncome, termInterest, lenderFeeAmount };
}

export function calculateInterestHoldback(loanAmount: number, interestRate: number, months: number): number {
    return (loanAmount * (interestRate / 100)) * (months / 12);
}
