import { Deal, Client, Property, Scenario } from '@brokerbox/db';
import { calculateNetAdvance, calculatePrivateEffectiveAPR } from '@brokerbox/core';

/**
 * Generates the FSRA Form 2.15: Borrower Disclosure Statement.
 * Required for all private mortgages in Ontario to clearly demonstrate exactly 
 * what the borrower is netting vs the gross loan, breaking down all fees, 
 * and showing the true APR.
 */
export async function generateForm215Document(
    deal: Deal & { parties: any[], property: Property | null, scenarios: Scenario[] }
) {
    if (!deal.scenarios || deal.scenarios.length === 0) {
        throw new Error('Must have an approved scenario to issue Form 2.15');
    }

    const tranche = deal.scenarios[0].tranches[0]; // Assuming single tranche for simplicity

    const feeConfig = {
        lenderFeePercent: tranche.lenderFeePercent,
        brokerFeePercent: tranche.brokerFeePercent,
        flatFees: 1500 // Assuming standard legal & admin deductions 
    };

    const costBreakdown = calculateNetAdvance(tranche.amount, feeConfig);
    const apr = calculatePrivateEffectiveAPR(
        tranche.amount,
        costBreakdown.netAdvanceToBorrower,
        tranche.rate,
        12 // Assuming standard 12 month term limit for private
    );

    const form215Data = {
        formType: 'FSRA_FORM_2_15_BORROWER_DISCLOSURE',
        generatedAt: new Date().toISOString(),
        propertyAddress: deal.property?.address || 'TBD',
        loanDetails: {
            grossLoanAmount: tranche.amount,
            contractInterestRate: `${(tranche.rate * 100).toFixed(2)}%`,
            termMonths: 12
        },
        financialDeductions: {
            lenderFee: costBreakdown.lenderFeeAmount,
            brokerFee: costBreakdown.brokerFeeAmount,
            otherFees: feeConfig.flatFees,
            totalDeductions: costBreakdown.totalDeductions
        },
        netAdvanceRemaining: costBreakdown.netAdvanceToBorrower,
        effectiveAPR: `${(apr * 100).toFixed(2)}%`,
        mandatoryWarnings: [
            "This mortgage is provided by a private lender or syndicate.",
            "You are strongly advised to obtain independent legal advice.",
            "The Annual Percentage Rate (APR) reflects the true cost of borrowing assuming fees are deducted from the advance."
        ],
        signaturesRequired: ['BORROWER', 'CO_BORROWER', 'BROKER']
    };

    return form215Data;
}
