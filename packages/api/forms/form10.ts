import { Deal } from '@brokerbox/db';

/**
 * Generates the FSRA Form 10: Conflict of Interest Disclosure Statement for a specific Deal.
 * This form is required by the Financial Services Regulatory Authority of Ontario
 * whenever the Broker or Brokerage has a defined direct or indirect interest in a mortgage transaction.
 */
export async function generateForm10Document(
    deal: Deal,
    brokerageName: string,
    brokerName: string,
    conflictType: 'LENDER_IS_BROKER' | 'FAMILY_RELATIONSHIP' | 'FEE_BASED_CONFLICT' | 'OTHER',
    conflictDescription: string
) {

    const form10Data = {
        formType: 'FSRA_FORM_10_CONFLICT_OF_INTEREST',
        generatedAt: new Date().toISOString(),
        dealId: deal.id,
        brokerageDetails: {
            name: brokerageName,
            agent: brokerName
        },
        conflictDetails: {
            type: conflictType,
            description: conflictDescription
        },
        declarations: [
            "The Mortgage Brokerage/Broker/Agent has a direct or indirect interest in this transaction.",
            "You are advised to seek independent legal or financial advice before proceeding."
        ],
        signaturesRequired: ['BORROWER', 'LENDER'] // Both parties must acknowledge
    };

    // In a production environment, this would generate a PDF via Puppeteer/PDFKit 
    // or return the raw payload to an E-Signature provider like DocuSign.
    return form10Data;
}
