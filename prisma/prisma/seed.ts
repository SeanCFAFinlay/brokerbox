import { prisma } from '../../src/lib/db'

async function main() {
    console.log('Seeding Database...')

    // Clear existing
    await prisma.dealStageHistory.deleteMany()
    await prisma.scenarioTranche.deleteMany()
    await prisma.scenario.deleteMany()
    await prisma.dealParty.deleteMany()
    await prisma.deal.deleteMany()
    await prisma.property.deleteMany()
    await prisma.clientContact.deleteMany()
    await prisma.client.deleteMany()
    await prisma.lenderCriteriaRule.deleteMany()
    await prisma.lenderProduct.deleteMany()
    await prisma.lender.deleteMany()

    // 1. Create Lenders
    const eqBank = await prisma.lender.create({
        data: {
            name: 'Equitable Bank',
            type: 'A_LENDER',
            products: {
                create: [
                    { name: 'Prime 1st', position: 1 },
                    { name: 'Alt-A 1st', position: 1 }
                ]
            },
            criteria: {
                create: {
                    version: 1,
                    rulesJson: JSON.stringify({
                        maxLtv: 80,
                        minCredit: 650,
                        maxGds: 39,
                        maxTds: 44,
                        allowedPropertyTypes: ['DETACHED', 'SEMI_DETACHED', 'CONDO']
                    })
                }
            }
        }
    })

    const privateLender = await prisma.lender.create({
        data: {
            name: 'Oak Tree Capital MIC',
            type: 'MIC',
            products: {
                create: [
                    { name: '2nd Mortgage', position: 2 },
                    { name: 'Bridge Loan', position: 1 }
                ]
            },
            criteria: {
                create: {
                    version: 1,
                    rulesJson: JSON.stringify({
                        maxLtv: 85,
                        minCredit: 500,
                        allowedRegions: ['Toronto', 'Vancouver', 'Calgary']
                    })
                }
            }
        }
    })

    // 2. Create Clients + Properties
    const client1 = await prisma.client.create({
        data: {
            firstName: 'Sarah',
            lastName: 'Chen',
            email: 'sarah.chen@example.com',
            phone: '416-555-0198',
            creditScore: 720,
            monthlyIncome: 12500,
            kycStatus: 'APPROVED',
            properties: {
                create: {
                    address: '123 King St W',
                    city: 'Toronto',
                    province: 'ON',
                    postalCode: 'M5V 1J5',
                    propertyType: 'CONDO',
                    value: 850000,
                    purchasePrice: 850000
                }
            }
        },
        include: { properties: true }
    })

    const client2 = await prisma.client.create({
        data: {
            firstName: 'Marcus',
            lastName: 'Tremblay',
            email: 'marcus.t@example.com',
            phone: '514-555-0102',
            creditScore: 640,
            monthlyIncome: 8200,
            kycStatus: 'PENDING',
            properties: {
                create: {
                    address: '456 Hastings St',
                    city: 'Vancouver',
                    province: 'BC',
                    postalCode: 'V6B 1H6',
                    propertyType: 'DETACHED',
                    value: 1250000,
                }
            }
        },
        include: { properties: true }
    })

    // 3. Create Deals + Scenarios
    await prisma.deal.create({
        data: {
            title: 'Condo Purchase - King St',
            stage: 'SUBMITTED',
            loanAmount: 680000,
            propertyId: client1.properties[0].id,
            parties: {
                create: {
                    clientId: client1.id,
                    role: 'PRIMARY_BORROWER'
                }
            },
            scenarios: {
                create: {
                    name: 'Prime Option (Recommended)',
                    isRecommended: true,
                    totalAmount: 680000,
                    blendedRate: 4.85,
                    monthlyPayment: 3890.50,
                    tranches: {
                        create: {
                            position: 1,
                            amount: 680000,
                            rate: 0.0485,
                            amortizationYears: 25
                        }
                    }
                }
            }
        }
    })

    await prisma.deal.create({
        data: {
            title: 'Hastings Refinance',
            stage: 'IN_REVIEW',
            loanAmount: 950000,
            propertyId: client2.properties[0].id,
            parties: {
                create: {
                    clientId: client2.id,
                    role: 'PRIMARY_BORROWER'
                }
            },
            scenarios: {
                create: {
                    name: '1st + 2nd Combo',
                    isRecommended: false,
                    totalAmount: 950000,
                    blendedRate: 6.45,
                    monthlyPayment: 6200.00,
                    tranches: {
                        create: [
                            {
                                position: 1,
                                amount: 750000,
                                rate: 0.052,
                                amortizationYears: 30
                            },
                            {
                                position: 2,
                                amount: 200000,
                                rate: 0.105,
                                amortizationYears: 20
                            }
                        ]
                    }
                }
            }
        }
    })

    console.log('Seed Payload Verified.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
