import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const FIRST = ['James', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Robert', 'Ashley', 'William', 'Jennifer', 'Daniel', 'Amanda', 'Matthew', 'Stephanie', 'Andrew', 'Nicole', 'Joshua', 'Megan', 'Christopher', 'Lauren', 'Ryan', 'Rebecca', 'Brandon', 'Samantha'];
const LAST = ['Thompson', 'Williams', 'Brown', 'Wilson', 'Taylor', 'Anderson', 'Martinez', 'Johnson', 'Lee', 'Harris', 'Clark', 'Robinson', 'Young', 'Walker', 'King', 'Scott', 'Adams', 'Baker'];
const CITIES = [
    { city: 'Toronto', prov: 'ON', postal: 'M5V' },
    { city: 'Vancouver', prov: 'BC', postal: 'V6B' },
    { city: 'Calgary', prov: 'AB', postal: 'T2P' },
    { city: 'Ottawa', prov: 'ON', postal: 'K1A' },
    { city: 'Mississauga', prov: 'ON', postal: 'L5B' },
    { city: 'Hamilton', prov: 'ON', postal: 'L8P' },
    { city: 'Montreal', prov: 'QC', postal: 'H2X' },
    { city: 'Winnipeg', prov: 'MB', postal: 'R3C' },
    { city: 'Edmonton', prov: 'AB', postal: 'T5J' },
    { city: 'Halifax', prov: 'NS', postal: 'B3H' },
];
const STREETS = ['123 King St', '456 Queen St', '789 Yonge St', '321 Bay St', '654 Bloor St', '987 Dundas St', '246 College St', '135 Front St', '864 Eglinton Ave', '753 Danforth Ave', '159 Spadina Ave', '482 Lawrence Ave', '371 Sheppard Ave', '612 Finch Ave', '843 Steeles Ave', '924 Kennedy Rd', '516 Warden Ave', '297 Victoria Park'];

const LENDERS = [
    { name: 'TD Canada Trust', minCreditScore: 680, maxLTV: 80, maxGDS: 39, maxTDS: 44, supportedProvinces: ['ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB'], propertyTypes: ['residential', 'condo'], positionTypes: ['1st'], productCategories: ['residential'], minLoan: 100000, maxLoan: 3000000, termMin: 12, termMax: 360, capitalAvailable: 50000000, capitalCommitted: 12000000, baseRate: 5.04, speed: 7, exceptionsTolerance: 3, appetite: 8, pricingPremium: 0, lenderFees: 0, documentRequirements: ['T4 Slips', 'Notice of Assessment', 'Pay Stubs', 'Letter of Employment', 'Bank Statements', 'Photo ID'] },
    { name: 'RBC Royal Bank', minCreditScore: 680, maxLTV: 80, maxGDS: 39, maxTDS: 44, supportedProvinces: ['ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE'], propertyTypes: ['residential', 'condo', 'commercial'], positionTypes: ['1st'], productCategories: ['residential', 'commercial'], minLoan: 75000, maxLoan: 5000000, termMin: 12, termMax: 360, capitalAvailable: 75000000, capitalCommitted: 20000000, baseRate: 4.99, speed: 6, exceptionsTolerance: 2, appetite: 9, pricingPremium: 0, lenderFees: 0, documentRequirements: ['T4 Slips', 'Notice of Assessment', 'Pay Stubs', 'Bank Statements', 'Photo ID', 'Property Appraisal'] },
    { name: 'Scotiabank', minCreditScore: 640, maxLTV: 80, maxGDS: 39, maxTDS: 44, supportedProvinces: ['ON', 'BC', 'AB', 'QC'], propertyTypes: ['residential', 'condo'], positionTypes: ['1st'], productCategories: ['residential'], minLoan: 100000, maxLoan: 2500000, termMin: 12, termMax: 300, capitalAvailable: 40000000, capitalCommitted: 8000000, baseRate: 5.09, speed: 7, exceptionsTolerance: 4, appetite: 7, pricingPremium: 0, lenderFees: 0, documentRequirements: ['T4 Slips', 'Pay Stubs', 'Letter of Employment', 'Bank Statements'] },
    { name: 'BMO', minCreditScore: 650, maxLTV: 80, maxGDS: 39, maxTDS: 44, supportedProvinces: ['ON', 'BC', 'AB', 'QC', 'MB', 'SK'], propertyTypes: ['residential', 'condo'], positionTypes: ['1st'], productCategories: ['residential'], minLoan: 80000, maxLoan: 3000000, termMin: 12, termMax: 360, capitalAvailable: 45000000, capitalCommitted: 10000000, baseRate: 5.14, speed: 5, exceptionsTolerance: 3, appetite: 6, pricingPremium: 0.05, lenderFees: 0.25, documentRequirements: ['T4 Slips', 'Notice of Assessment', 'Pay Stubs', 'Photo ID'] },
    { name: 'CIBC', minCreditScore: 680, maxLTV: 80, maxGDS: 35, maxTDS: 42, supportedProvinces: ['ON', 'BC', 'AB', 'QC'], propertyTypes: ['residential'], positionTypes: ['1st'], productCategories: ['residential'], minLoan: 100000, maxLoan: 2000000, termMin: 12, termMax: 300, capitalAvailable: 35000000, capitalCommitted: 7000000, baseRate: 5.19, speed: 6, exceptionsTolerance: 2, appetite: 5, pricingPremium: 0, lenderFees: 0, documentRequirements: ['T4 Slips', 'Notice of Assessment', 'Letter of Employment', 'Bank Statements', 'Property Appraisal'] },
    { name: 'First National', minCreditScore: 600, maxLTV: 85, maxGDS: 39, maxTDS: 44, supportedProvinces: ['ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS'], propertyTypes: ['residential', 'condo', 'commercial'], positionTypes: ['1st', '2nd'], productCategories: ['residential', 'commercial'], minLoan: 50000, maxLoan: 5000000, termMin: 6, termMax: 360, capitalAvailable: 60000000, capitalCommitted: 15000000, baseRate: 5.29, speed: 8, exceptionsTolerance: 6, appetite: 8, pricingPremium: 0.15, lenderFees: 0.5, documentRequirements: ['T4 Slips', 'Pay Stubs', 'Bank Statements'] },
    { name: 'MCAP', minCreditScore: 580, maxLTV: 90, maxGDS: 44, maxTDS: 50, supportedProvinces: ['ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE'], propertyTypes: ['residential', 'condo', 'commercial', 'multi-unit'], positionTypes: ['1st', '2nd', 'bridge'], productCategories: ['residential', 'commercial', 'bridge'], minLoan: 50000, maxLoan: 10000000, termMin: 3, termMax: 360, capitalAvailable: 80000000, capitalCommitted: 25000000, baseRate: 5.49, speed: 9, exceptionsTolerance: 7, appetite: 9, pricingPremium: 0.25, lenderFees: 1.0, documentRequirements: ['T4 Slips', 'Pay Stubs'] },
    { name: 'Equitable Bank', minCreditScore: 550, maxLTV: 85, maxGDS: 50, maxTDS: 55, supportedProvinces: ['ON', 'BC', 'AB'], propertyTypes: ['residential', 'condo', 'commercial', 'multi-unit', 'land'], positionTypes: ['1st', '2nd', '3rd'], productCategories: ['residential', 'commercial', 'land', 'construction'], minLoan: 25000, maxLoan: 15000000, termMin: 3, termMax: 360, capitalAvailable: 100000000, capitalCommitted: 35000000, baseRate: 5.99, speed: 8, exceptionsTolerance: 8, appetite: 7, pricingPremium: 0.5, lenderFees: 1.5, documentRequirements: ['T4 Slips', 'Notice of Assessment', 'Bank Statements', 'Property Appraisal'] },
    { name: 'Home Trust', minCreditScore: 500, maxLTV: 75, maxGDS: 50, maxTDS: 55, supportedProvinces: ['ON', 'BC', 'AB', 'QC'], propertyTypes: ['residential', 'condo', 'commercial'], positionTypes: ['1st', '2nd'], productCategories: ['residential', 'commercial', 'bridge'], minLoan: 50000, maxLoan: 5000000, termMin: 6, termMax: 360, capitalAvailable: 55000000, capitalCommitted: 18000000, baseRate: 6.49, speed: 7, exceptionsTolerance: 9, appetite: 6, pricingPremium: 0.75, lenderFees: 1.5, documentRequirements: ['T4 Slips', 'Bank Statements'] },
    { name: 'Bridgewater Bank', minCreditScore: 620, maxLTV: 80, maxGDS: 39, maxTDS: 44, supportedProvinces: ['AB', 'BC', 'ON'], propertyTypes: ['residential', 'condo'], positionTypes: ['1st'], productCategories: ['residential'], minLoan: 100000, maxLoan: 2000000, termMin: 12, termMax: 300, capitalAvailable: 25000000, capitalCommitted: 5000000, baseRate: 5.39, speed: 6, exceptionsTolerance: 5, appetite: 5, pricingPremium: 0.1, lenderFees: 0.5, documentRequirements: ['T4 Slips', 'Notice of Assessment', 'Pay Stubs', 'Letter of Employment', 'Bank Statements', 'Photo ID', 'Proof of Down Payment'] },
];

const STAGES = ['intake', 'in_review', 'matched', 'committed', 'funded'];
const EMPLOYMENT = ['employed', 'self-employed', 'retired'];
const POSITIONS = ['1st', '2nd'];
const LOAN_PURPOSES = ['purchase', 'refinance', 'renewal', 'equity_takeout', 'bridge'];
const OCCUPANCY = ['owner_occupied', 'rental', 'investment'];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randBetween(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function main() {
    console.log('🌱 Seeding BrokerBox database...');

    // Clean (order matters for FK constraints)
    await prisma.dealStageHistory.deleteMany();
    await prisma.note.deleteMany();
    await prisma.documentFile.deleteMany();
    await prisma.docRequest.deleteMany();
    await prisma.scenario.deleteMany();
    await prisma.deal.deleteMany();
    await prisma.borrower.deleteMany();
    await prisma.lender.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.brokerageSettings.deleteMany();

    // Brokerage Settings (singleton)
    await prisma.brokerageSettings.create({
        data: {
            id: 'default',
            brokerageName: 'BrokerBox Financial Group',
            licenseNumber: 'FSRA-12345',
            principalBroker: 'Sean Finlay',
            officeAddress: '100 King Street West, Suite 5600, Toronto, ON M5X 1C7',
            officePhone: '416-555-0100',
            officeEmail: 'info@brokerbox.ca',
            defaultBrokerFee: 1.0,
            defaultLenderFee: 0.5,
            defaultTermMonths: 12,
            defaultAmortMonths: 300,
            defaultInterestRate: 5.5,
        },
    });
    console.log('  ✓ brokerage settings');

    // Lenders
    const lenderRecords = [];
    for (const l of LENDERS) {
        const lender = await prisma.lender.create({ data: l });
        lenderRecords.push(lender);
        await prisma.auditLog.create({ data: { actor: 'system', entity: 'Lender', entityId: lender.id, action: 'CREATE' } });
    }
    console.log(`  ✓ ${lenderRecords.length} lenders`);

    // Borrowers
    const borrowerRecords = [];
    for (let i = 0; i < 24; i++) {
        const loc = rand(CITIES);
        const borrower = await prisma.borrower.create({
            data: {
                firstName: FIRST[i],
                lastName: rand(LAST),
                email: `${FIRST[i].toLowerCase()}.${rand(LAST).toLowerCase()}${i}@example.com`,
                phone: `416-${randBetween(200, 999)}-${randBetween(1000, 9999)}`,
                address: rand(STREETS),
                city: loc.city,
                province: loc.prov,
                postalCode: `${loc.postal} ${randBetween(1, 9)}${String.fromCharCode(65 + randBetween(0, 25))}${randBetween(1, 9)}`,
                income: randBetween(55000, 220000),
                verifiedIncome: Math.random() > 0.5 ? randBetween(50000, 200000) : null,
                employmentStatus: rand(EMPLOYMENT),
                borrowerType: i < 20 ? 'primary' : 'co-borrower',
                liabilities: randBetween(200, 2500),
                creditScore: randBetween(520, 820),
                creditScoreDate: new Date(Date.now() - randBetween(0, 180) * 86400000),
            },
        });
        borrowerRecords.push(borrower);
        await prisma.auditLog.create({ data: { actor: 'system', entity: 'Borrower', entityId: borrower.id, action: 'CREATE' } });
    }
    console.log(`  ✓ ${borrowerRecords.length} borrowers`);

    // Deals
    const dealRecords = [];
    for (let i = 0; i < 18; i++) {
        const borrower = borrowerRecords[i % borrowerRecords.length];
        const lender = rand(lenderRecords);
        const propValue = randBetween(300000, 1500000);
        const loanAmt = Math.round(propValue * (randBetween(60, 90) / 100));
        const ltv = (loanAmt / propValue) * 100;
        const stage = rand(STAGES);
        const loc = rand(CITIES);
        const position = rand(POSITIONS);
        const purpose = rand(LOAN_PURPOSES);

        const deal = await prisma.deal.create({
            data: {
                borrowerId: borrower.id,
                lenderId: stage === 'committed' || stage === 'funded' ? lender.id : null,
                stage,
                priority: rand(['low', 'normal', 'normal', 'high', 'urgent']),
                propertyAddress: `${rand(STREETS)}, ${loc.city}, ${loc.prov}`,
                propertyType: rand(['residential', 'condo', 'commercial']),
                propertyValue: propValue,
                loanAmount: loanAmt,
                interestRate: lender.baseRate + lender.pricingPremium,
                termMonths: rand([6, 12, 24, 60, 120, 300]),
                position,
                loanPurpose: purpose,
                occupancyType: rand(OCCUPANCY),
                ltv: +ltv.toFixed(1),
                matchScore: stage !== 'intake' ? randBetween(40, 95) : null,
                brokerFee: 1.0,
                lenderFee: lender.lenderFees,
                closingDate: stage === 'funded' ? new Date(Date.now() - randBetween(0, 90) * 86400000) : null,
                fundingDate: stage === 'funded' ? new Date(Date.now() - randBetween(0, 60) * 86400000) : null,
            },
        });
        dealRecords.push(deal);
        await prisma.auditLog.create({ data: { actor: 'demo', entity: 'Deal', entityId: deal.id, action: 'CREATE' } });

        // Stage history entry
        if (stage !== 'intake') {
            await prisma.dealStageHistory.create({
                data: { dealId: deal.id, fromStage: 'intake', toStage: stage, changedBy: 'demo' },
            });
        }
    }
    console.log(`  ✓ ${dealRecords.length} deals`);

    // Doc Requests
    const DOC_TYPES = ['T4 Slips', 'Notice of Assessment', 'Pay Stubs', 'Letter of Employment', 'Bank Statements', 'Photo ID', 'Property Appraisal'];
    const DOC_CATEGORIES: Record<string, string> = {
        'T4 Slips': 'income', 'Notice of Assessment': 'income', 'Pay Stubs': 'income',
        'Letter of Employment': 'income', 'Bank Statements': 'income',
        'Photo ID': 'identity', 'Property Appraisal': 'property',
    };
    let docCount = 0;
    for (let i = 0; i < 12; i++) {
        const borrower = borrowerRecords[i % borrowerRecords.length];
        const docType = rand(DOC_TYPES);
        await prisma.docRequest.create({
            data: {
                borrowerId: borrower.id,
                dealId: dealRecords[i % dealRecords.length]?.id || null,
                docType,
                category: DOC_CATEGORIES[docType] || 'general',
                status: rand(['requested', 'uploaded', 'verified', 'rejected']),
            },
        });
        docCount++;
    }
    console.log(`  ✓ ${docCount} doc requests`);

    // Notes
    let noteCount = 0;
    for (let i = 0; i < 8; i++) {
        const deal = dealRecords[i % dealRecords.length];
        await prisma.note.create({
            data: {
                entityType: 'Deal',
                entityId: deal.id,
                content: rand([
                    'Called borrower to confirm employment details. Verified.',
                    'Appraisal ordered — expected back in 5 business days.',
                    'Lender requested additional bank statements. Forwarded to borrower.',
                    'Rate hold confirmed at current terms. Expires in 30 days.',
                    'Borrower confirmed closing date works. Lawyer notified.',
                    'Co-borrower documents still outstanding. Following up.',
                    'Credit bureau pulled — score matches application.',
                    'Property inspection complete — no issues found.',
                ]),
                createdBy: 'demo',
            },
        });
        noteCount++;
    }
    for (let i = 0; i < 5; i++) {
        const borrower = borrowerRecords[i];
        await prisma.note.create({
            data: {
                entityType: 'Borrower',
                entityId: borrower.id,
                content: rand([
                    'Initial intake call complete. Good candidate for conventional financing.',
                    'Client referred by existing customer. Pre-qualified at meeting.',
                    'Self-employed — will need NOA and T1 Generals.',
                    'Returning client — previous deal funded successfully.',
                    'High net worth client, multiple properties in portfolio.',
                ]),
                createdBy: 'demo',
            },
        });
        noteCount++;
    }
    console.log(`  ✓ ${noteCount} notes`);

    console.log('✅ Seed complete!');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
