import { Deal, Client, Property, Scenario } from '@brokerbox/db';

/**
 * Generates the FSRA Form 1: Investor/Lender Disclosure Statement for a specific Deal.
 * This form is required by the Financial Services Regulatory Authority of Ontario
 * prior to any private mortgage commitment.
 */
export async function generateForm1Document(
    deal: Deal & { parties: any[], property: Property | null, scenarios: Scenario[] }
) {
    if (!deal.property) {
        throw new Error('A property must be attached to the deal to generate Form 1.');
    }

    // Extract exactly who the borrowers are (for privacy, Form 1 focuses on the risk/return for the lender)
    const primaryBorrowerParty = deal.parties.find(p => p.role === 'PRIMARY_BORROWER');
    const lenderReturnTranche = deal.scenarios[0]?.tranches[0]; // Assuming first scenario/first chunk for demo

    if (!lenderReturnTranche) {
        throw new Error('Cannot generate Form 1 without a defined financing scenario tranche.');
    }

    const form1Data = {
        formType: 'FSRA_FORM_1_INVESTOR_DISCLOSURE',
        generatedAt: new Date().toISOString(),
        propertyDetails: {
            address: deal.property.address,
            city: deal.property.city,
            estimatedValue: deal.property.value,
        },
        financials: {
            principalAmount: lenderReturnTranche.amount,
            interestRate: lenderReturnTranche.rate,
            rank: lenderReturnTranche.position,
            amortization: lenderReturnTranche.amortizationYears
        },
        riskWarnings: [
            "This is a high-risk investment. You could lose all or part of your investment.",
            "This investment is not insured by the Financial Services Regulatory Authority of Ontario (FSRA).",
            "There is no guaranteed market for this mortgage if you need to cash out early."
        ],
        signaturesRequired: ['LENDER', 'BROKER']
    };

    // In a production environment, this would generate a PDF via Puppeteer/PDFKit 
    // or return the raw payload to an E-Signature provider like DocuSign.
    return form1Data;
}
