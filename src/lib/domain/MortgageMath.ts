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

/**
 * @deprecated Legacy Mortgage logic. Use Asset-Based Lending (LTV) where possible.
 */
export function calculateGDS(input: GdsTdsInput): number {
    const housingCosts = input.principal + input.interest + input.taxes + input.heat + (input.condoFees || 0) * 0.5;
    return (housingCosts / (input.grossIncome / 12)) * 100;
}

/**
 * @deprecated Legacy Mortgage logic. Use Asset-Based Lending (LTV) where possible.
 */
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

// Dashboard Utilities
export function pipelineVolume(deals: any[]): number {
    return deals
        .filter(d => ['intake', 'in_review', 'matched', 'committed'].includes(d.stage))
        .reduce((sum, d) => sum + (d.loanAmount || 0), 0);
}

export function fundedVolume(deals: any[]): number {
    return deals
        .filter(d => d.stage === 'funded')
        .reduce((sum, d) => sum + (d.loanAmount || 0), 0);
}

export function closeRate(deals: any[]): number {
    const funded = deals.filter(d => d.stage === 'funded').length;
    const total = deals.filter(d => ['funded', 'declined', 'archived'].includes(d.stage)).length;
    return total > 0 ? (funded / total) * 100 : 0;
}

export function avgDaysToFund(deals: any[]): number {
    const fundedDeals = deals.filter(d => d.stage === 'funded' && d.fundingDate && d.createdAt);
    if (fundedDeals.length === 0) return 0;
    const totalDays = fundedDeals.reduce((sum, d) => {
        const start = new Date(d.createdAt).getTime();
        const end = new Date(d.fundingDate).getTime();
        return sum + (end - start) / (1000 * 60 * 60 * 24);
    }, 0);
    return totalDays / fundedDeals.length;
}

export function fundedCount(deals: any[]): number {
    return deals.filter(d => d.stage === 'funded').length;
}

export function getNextBestActions(borrowers: any[], deals: any[], tasks: any[], docs: any[]) {
    const actions: any[] = [];
    
    // Logic for NBA
    deals.filter(d => d.stage === 'intake').forEach(d => {
        actions.push({
            type: 'deal_stalled',
            title: 'File in Intake',
            reason: 'Needs to be moved to Review',
            entityId: d.id,
            href: `/deals/${d.id}`
        });
    });

    return actions;
}
