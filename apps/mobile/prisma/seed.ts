import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding BrokerBox database...')

    // Clean existing robustly (since foreign keys cascade, delete parents)
    await prisma.deal.deleteMany()
    await prisma.property.deleteMany()
    await prisma.client.deleteMany()
    await prisma.lender.deleteMany()
    await prisma.userProfile.deleteMany()

    // 1. Create Users
    const broker = await prisma.userProfile.create({
        data: {
            email: 'alex.broker@brokerbox.com',
            firstName: 'Alex',
            lastName: 'Sterling',
            role: 'ADMIN'
        }
    })

    // 2. Create Lenders with Editable Criteria Rules
    const lenderA = await prisma.lender.create({
        data: {
            name: 'Equitable Bank',
            type: 'A_LENDER',
            isActive: true,
            capacities: {
                create: { totalCapital: 500000000, deployedCapital: 120000000, vintageMonth: new Date() }
            },
            products: {
                create: [
                    { name: 'Prime First Mortgage', position: 1, termMonths: 60, amortMonths: 300 }
                ]
            },
            criteria: {
                create: {
                    version: 1,
                    rulesJson: JSON.stringify({
                        maxLtv: 80,
                        minCredit: 680,
                        maxGds: 39,
                        maxTds: 44,
                        allowedRegions: ['Toronto', 'Vancouver', 'Calgary']
                    })
                }
            }
        }
    })

    const lenderB = await prisma.lender.create({
        data: {
            name: 'Home Trust',
            type: 'B_LENDER',
            isActive: true,
            capacities: {
                create: { totalCapital: 300000000, deployedCapital: 80000000, vintageMonth: new Date() }
            },
            products: {
                create: [
                    { name: 'Alt-A First Mortgage', position: 1, termMonths: 24, amortMonths: 360 }
                ]
            },
            criteria: {
                create: {
                    version: 1,
                    rulesJson: JSON.stringify({
                        maxLtv: 85,
                        minCredit: 600,
                        maxGds: 45,
                        maxTds: 50
                    })
                }
            }
        }
    })

    const lenderMIC = await prisma.lender.create({
        data: {
            name: 'Trez Capital (MIC)',
            type: 'MIC',
            isActive: true,
            capacities: {
                create: { totalCapital: 100000000, deployedCapital: 98000000, vintageMonth: new Date() }
            },
            products: {
                create: [
                    { name: 'Second Mortgage Construction', position: 2, termMonths: 12, amortMonths: 12 }
                ]
            },
            criteria: {
                create: {
                    version: 1,
                    rulesJson: JSON.stringify({
                        maxLtv: 75,
                        minCredit: 500
                    })
                }
            }
        }
    })

    const lenderPrivate = await prisma.lender.create({
        data: {
            name: 'Apex Private Fund',
            type: 'PRIVATE',
            isActive: true,
            capacities: {
                create: { totalCapital: 50000000, deployedCapital: 10000000, vintageMonth: new Date() }
            },
            products: {
                create: [
                    { name: 'Private 1st/2nd Fast Fund', position: 1, termMonths: 12, amortMonths: 12 }
                ]
            },
            criteria: {
                create: {
                    version: 1,
                    rulesJson: JSON.stringify({
                        maxLtv: 70,
                        allowedPropertyTypes: ['DETACHED', 'TOWNHOUSE']
                    })
                }
            }
        }
    })

    // 3. Create Clients & Properties
    const client1 = await prisma.client.create({
        data: {
            firstName: 'Sarah',
            lastName: 'Chen',
            email: 'sarah.chen@example.com',
            phone: '416-555-0198',
            creditScore: 720,
            monthlyIncome: 125000,
            totalLiabilities: 25000,
            kycStatus: 'APPROVED'
        }
    })

    const prop1 = await prisma.property.create({
        data: {
            clientId: client1.id,
            address: '109 King St W',
            city: 'Toronto',
            province: 'ON',
            propertyType: 'CONDO',
            value: 850000,
            occupancy: 'OWNER_OCCUPIED',
            condoFees: 450,
            annualTaxes: 3600
        }
    })

    const client2 = await prisma.client.create({
        data: {
            firstName: 'James',
            lastName: 'Patterson',
            email: 'j.patterson@example.com',
            phone: '604-555-0921',
            creditScore: 610, // low credit
            monthlyIncome: 95000,
            totalLiabilities: 80000,
            kycStatus: 'APPROVED'
        }
    })

    const prop2 = await prisma.property.create({
        data: {
            clientId: client2.id,
            address: '4452 Hastings St',
            city: 'Vancouver',
            province: 'BC',
            propertyType: 'DETACHED',
            value: 1250000,
            occupancy: 'OWNER_OCCUPIED',
            annualTaxes: 5400
        }
    })

    // 4. Create Deals & Scenarios
    const deal1 = await prisma.deal.create({
        data: {
            title: 'Condo Purchase - King St',
            propertyId: prop1.id,
            stage: 'UNDERWRITING',
            loanAmount: 680000,
            purpose: 'PURCHASE',
            closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            parties: {
                create: { clientId: client1.id, role: 'PRIMARY_BORROWER' }
            },
            stageHistory: {
                create: [
                    { newStage: 'NEW', changedBy: broker.id },
                    { oldStage: 'NEW', newStage: 'DOCS_REQUESTED', changedBy: broker.id },
                    { oldStage: 'DOCS_REQUESTED', newStage: 'UNDERWRITING', changedBy: broker.id }
                ]
            },
            scenarios: {
                create: [
                    {
                        name: 'A-Lender Prime',
                        isRecommended: true,
                        totalAmount: 680000,
                        tranches: {
                            create: [
                                { position: 1, amount: 680000, rate: 0.0485, termMonths: 60, amortMonths: 300, payment: 3942.50 }
                            ]
                        }
                    }
                ]
            }
        }
    })

    const deal2 = await prisma.deal.create({
        data: {
            title: 'Hastings Refinance (B-Lender)',
            propertyId: prop2.id,
            stage: 'MATCHED',
            loanAmount: 950000,
            purpose: 'REFINANCE',
            parties: {
                create: { clientId: client2.id, role: 'PRIMARY_BORROWER' }
            },
            scenarios: {
                create: [
                    {
                        name: 'Home Trust Alt-A',
                        isRecommended: true,
                        totalAmount: 950000,
                        tranches: {
                            create: [
                                { position: 1, amount: 950000, rate: 0.062, termMonths: 24, amortMonths: 360, payment: 5885.20 }
                            ]
                        }
                    }
                ]
            },
            matches: {
                create: [
                    { lenderId: lenderB.id, score: 92, status: 'MATCHED', notes: 'Best fit for 610 credit score.' },
                    { lenderId: lenderMIC.id, score: 85, status: 'DECLINED', notes: 'Rates too high relative to alt-A options.' }
                ]
            }
        }
    })

    // 5. Activity Feed
    await prisma.activityFeed.createMany({
        data: [
            { type: 'DEAL_MOVED', title: 'Deal moved to Underwriting', description: 'Condo Purchase - King St', entityId: deal1.id, actorId: broker.id },
            { type: 'MATCH_FOUND', title: 'Lender Matches Found', description: 'Found 2 lenders for Hastings Refinance', entityId: deal2.id, actorId: broker.id }
        ]
    })

    console.log('Seeding complete.')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
