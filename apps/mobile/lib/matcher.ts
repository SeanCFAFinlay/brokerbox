// Lender Criteria Rules & Matching Engine
export function evaluateLenderCriteria(
    deal: {
        loanAmount: number;
        propertyValue: number;
        city?: string;
        propertyType: string;
    },
    borrower: {
        creditScore?: number;
        gds?: number;
        tds?: number;
    },
    rulesJson: string
): { isEligible: boolean; reasons: string[] } {
    try {
        const rules = JSON.parse(rulesJson)
        const reasons: string[] = []
        let isEligible = true

        // Compute metrics
        const ltv = (deal.loanAmount / deal.propertyValue) * 100

        // Evaluate basic rules
        if (rules.maxLtv && ltv > rules.maxLtv) {
            isEligible = false
            reasons.push(`LTV (${ltv.toFixed(1)}%) exceeds maximum allowed (${rules.maxLtv}%).`)
        }

        if (rules.minCredit && borrower.creditScore && borrower.creditScore < rules.minCredit) {
            isEligible = false
            reasons.push(`Credit score (${borrower.creditScore}) is below minimum requirement (${rules.minCredit}).`)
        }

        if (rules.maxGds && borrower.gds && borrower.gds > rules.maxGds) {
            isEligible = false
            reasons.push(`GDS (${borrower.gds.toFixed(1)}%) exceeds maximum allowed (${rules.maxGds}%).`)
        }

        if (rules.maxTds && borrower.tds && borrower.tds > rules.maxTds) {
            isEligible = false
            reasons.push(`TDS (${borrower.tds.toFixed(1)}%) exceeds maximum allowed (${rules.maxTds}%).`)
        }

        // List-based rules
        if (rules.allowedRegions && rules.allowedRegions.length > 0 && deal.city) {
            if (!rules.allowedRegions.includes(deal.city)) {
                isEligible = false
                reasons.push(`Property location (${deal.city}) is outside allowed regions.`)
            }
        }

        if (rules.allowedPropertyTypes && rules.allowedPropertyTypes.length > 0) {
            if (!rules.allowedPropertyTypes.includes(deal.propertyType)) {
                isEligible = false
                reasons.push(`Property type (${deal.propertyType}) is not supported by this lender.`)
            }
        }

        if (isEligible) {
            reasons.push('Meets all criteria.')
        }

        return { isEligible, reasons }

    } catch (error) {
        console.error('Failed to parse criteria rules', error)
        return { isEligible: false, reasons: ['Invalid criteria rules format.'] }
    }
}
