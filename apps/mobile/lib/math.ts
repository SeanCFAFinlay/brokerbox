// core mortgage math & stress tests

export function calculateMortgagePayment(
    principal: number,
    annualRate: number,
    amortizationYears: number,
    paymentsPerYear: number = 12
): number {
    if (principal <= 0 || amortizationYears <= 0) return 0
    if (annualRate === 0) return principal / (amortizationYears * paymentsPerYear)

    // Canadian mortgages typically compound semi-annually
    const effectiveAnnualRate = Math.pow(1 + annualRate / 2, 2) - 1
    const periodRate = Math.pow(1 + effectiveAnnualRate, 1 / paymentsPerYear) - 1
    const totalPeriods = amortizationYears * paymentsPerYear

    return (
        (principal * periodRate * Math.pow(1 + periodRate, totalPeriods)) /
        (Math.pow(1 + periodRate, totalPeriods) - 1)
    )
}

export function calculateBlendedRate(
    tranches: Array<{ amount: number; rate: number }>
): number {
    if (!tranches || tranches.length === 0) return 0

    const totalAmount = tranches.reduce((sum, t) => sum + t.amount, 0)
    if (totalAmount === 0) return 0

    const weightedSum = tranches.reduce((sum, t) => sum + t.amount * t.rate, 0)
    return weightedSum / totalAmount
}

export function calculateCombinedPayment(
    tranches: Array<{ amount: number; rate: number; amortizationYears: number }>
): number {
    return tranches.reduce(
        (total, t) => total + calculateMortgagePayment(t.amount, t.rate, t.amortizationYears),
        0
    )
}

export function calculateLTV(totalLoan: number, propertyValue: number): number {
    if (propertyValue <= 0) return 0
    return (totalLoan / propertyValue) * 100
}

/**
 * Canadian Stress Test Rate (B-20 Guideline)
 * Typically higher of: Contract Rate + 2%, or 5.25%
 */
export function getStressTestRate(contractRate: number): number {
    const STRESS_FLOOR = 0.0525
    const buffer = contractRate + 0.02
    return Math.max(STRESS_FLOOR, buffer)
}

export interface QualificationParams {
    principalAndInterest: number // monthly
    annualTaxes: number
    heating: number // monthly
    condoFees: number // monthly
    otherDebts: number // monthly
    grossIncome: number // annual
}

export function calculateGDS(params: QualificationParams): number {
    if (params.grossIncome <= 0) return 0
    const monthlyIncome = params.grossIncome / 12
    const monthlyTaxes = params.annualTaxes / 12
    // Usually half of condo fees are included in GDS
    const monthlyCondo = params.condoFees * 0.5

    const totalHousingCosts = params.principalAndInterest + monthlyTaxes + params.heating + monthlyCondo
    return (totalHousingCosts / monthlyIncome) * 100
}

export function calculateTDS(params: QualificationParams): number {
    if (params.grossIncome <= 0) return 0
    const monthlyIncome = params.grossIncome / 12
    const monthlyTaxes = params.annualTaxes / 12
    const monthlyCondo = params.condoFees * 0.5

    const totalCosts = params.principalAndInterest + monthlyTaxes + params.heating + monthlyCondo + params.otherDebts
    return (totalCosts / monthlyIncome) * 100
}

export function getQualificationResult(
    contractRate: number,
    mortgageAmount: number,
    amortizationYears: number,
    params: Omit<QualificationParams, 'principalAndInterest'>
): { isQualified: boolean; gds: number; tds: number; reasons: string[] } {
    const stressRate = getStressTestRate(contractRate)
    const stressPayment = calculateMortgagePayment(mortgageAmount, stressRate, amortizationYears)

    const fullParams = { ...params, principalAndInterest: stressPayment }
    const gds = calculateGDS(fullParams)
    const tds = calculateTDS(fullParams)

    const reasons: string[] = []
    let isQualified = true

    // Standard CMHC limits are 39% GDS and 44% TDS 
    if (gds > 39) {
        isQualified = false
        reasons.push(`GDS is ${gds.toFixed(2)}%, exceeds 39% limit.`)
    }
    if (tds > 44) {
        isQualified = false
        reasons.push(`TDS is ${tds.toFixed(2)}%, exceeds 44% limit.`)
    }

    if (isQualified) {
        reasons.push('Passes standard stress test qualification.')
    }

    return { isQualified, gds, tds, reasons }
}
