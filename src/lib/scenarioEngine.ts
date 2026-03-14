export interface ScenarioInputs {
    propertyValue: number;
    interestRate: number;
    amortYears?: number;
    termMonths?: number;
    downPayment?: number;
    currentBalance?: number;
    additionalDebt?: number;
    loanAmount?: number;
    costToBuild?: number;
    annualIncome?: number;
    monthlyDebts?: number;
    propertyTax?: number;
    heating?: number;
    exitCost?: number;
}

export function computeScenario(type: string, inputs: ScenarioInputs) {
    const pv = inputs.propertyValue || 0;
    let loan = 0;
    let payment = 0;
    let isInterestOnly = false;

    if (type === 'purchase') {
        loan = pv - (inputs.downPayment || 0);
    } else if (type === 'bridge' || type === 'construction') {
        loan = inputs.loanAmount || (type === 'construction' ? (inputs.costToBuild || 0) * 0.75 : 0);
        isInterestOnly = true;
    } else {
        loan = (inputs.currentBalance || 0) + (inputs.additionalDebt || 0);
    }

    const rate = (inputs.interestRate || 5.5) / 100 / 12;

    if (isInterestOnly) {
        payment = loan * rate;
    } else {
        const n = (inputs.amortYears || 25) * 12;
        payment = rate > 0 ? (loan * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1) : loan / n;
    }

    const ltv = pv > 0 ? (loan / pv) * 100 : 0;
    const monthlyIncome = (inputs.annualIncome || 0) / 12;
    const pih = payment + (inputs.propertyTax || 0) + (inputs.heating || 0);

    const gds = monthlyIncome > 0 ? (pih / monthlyIncome) * 100 : 0;
    const tds = monthlyIncome > 0 ? ((pih + (inputs.monthlyDebts || 0)) / monthlyIncome) * 100 : 0;

    return {
        loanAmount: Math.round(loan),
        monthlyPayment: Math.round(payment),
        ltv: +ltv.toFixed(1),
        gds: +gds.toFixed(1),
        tds: +tds.toFixed(1),
        isInterestOnly,
        exitCost: inputs.exitCost || 0
    };
}
