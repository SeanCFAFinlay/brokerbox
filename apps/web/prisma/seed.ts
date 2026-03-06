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
    { name: 'TD Canada Trust', minCreditScore: 680, maxLTV: 80, maxGDS: 39, maxTDS: 44, supportedProvinces: ['ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB'], propertyTypes: ['residential', 'condo'], baseRate: 5.04, speed: 7, exceptionsTolerance: 3, appetite: 8, pricingPremium: 0, documentRequirements: ['T4 Slips', 'Notice of Assessment', 'Pay Stubs', 'Letter of Employment', 'Bank Statements', 'Photo ID'] },
    { name: 'RBC Royal Bank', minCreditScore: 680, maxLTV: 80, maxGDS: 39, maxTDS: 44, supportedProvinces: ['ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE'], propertyTypes: ['residential', 'condo', 'commercial'], baseRate: 4.99, speed: 6, exceptionsTolerance: 2, appetite: 9, pricingPremium: 0, documentRequirements: ['T4 Slips', 'Notice of Assessment', 'Pay Stubs', 'Bank Statements', 'Photo ID', 'Property Appraisal'] },
    { name: 'Scotiabank', minCreditScore: 640, maxLTV: 80, maxGDS: 39, maxTDS: 44, supportedProvinces: ['ON', 'BC', 'AB', 'QC'], propertyTypes: ['residential', 'condo'], baseRate: 5.09, speed: 7, exceptionsTolerance: 4, appetite: 7, pricingPremium: 0, documentRequirements: ['T4 Slips', 'Pay Stubs', 'Letter of Employment', 'Bank Statements'] },
    { name: 'BMO', minCreditScore: 650, maxLTV: 80, maxGDS: 39, maxTDS: 44, supportedProvinces: ['ON', 'BC', 'AB', 'QC', 'MB', 'SK'], propertyTypes: ['residential', 'condo'], baseRate: 5.14, speed: 5, exceptionsTolerance: 3, appetite: 6, pricingPremium: 0.05, documentRequirements: ['T4 Slips', 'Notice of Assessment', 'Pay Stubs', 'Photo ID'] },
    { name: 'CIBC', minCreditScore: 680, maxLTV: 80, maxGDS: 35, maxTDS: 42, supportedProvinces: ['ON', 'BC', 'AB', 'QC'], propertyTypes: ['residential'], baseRate: 5.19, speed: 6, exceptionsTolerance: 2, appetite: 5, pricingPremium: 0, documentRequirements: ['T4 Slips', 'Notice of Assessment', 'Letter of Employment', 'Bank Statements', 'Property Appraisal'] },
    { name: 'First National', minCreditScore: 600, maxLTV: 85, maxGDS: 39, maxTDS: 44, supportedProvinces: ['ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS'], propertyTypes: ['residential', 'condo', 'commercial'], baseRate: 5.29, speed: 8, exceptionsTolerance: 6, appetite: 8, pricingPremium: 0.15, documentRequirements: ['T4 Slips', 'Pay Stubs', 'Bank Statements'] },
    { name: 'MCAP', minCreditScore: 580, maxLTV: 90, maxGDS: 44, maxTDS: 50, supportedProvinces: ['ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE'], propertyTypes: ['residential', 'condo', 'commercial', 'multi-unit'], baseRate: 5.49, speed: 9, exceptionsTolerance: 7, appetite: 9, pricingPremium: 0.25, documentRequirements: ['T4 Slips', 'Pay Stubs'] },
    { name: 'Equitable Bank', minCreditScore: 550, maxLTV: 85, maxGDS: 50, maxTDS: 55, supportedProvinces: ['ON', 'BC', 'AB'], propertyTypes: ['residential', 'condo', 'commercial', 'multi-unit', 'land'], baseRate: 5.99, speed: 8, exceptionsTolerance: 8, appetite: 7, pricingPremium: 0.5, documentRequirements: ['T4 Slips', 'Notice of Assessment', 'Bank Statements', 'Property Appraisal'] },
    { name: 'Home Trust', minCreditScore: 500, maxLTV: 75, maxGDS: 50, maxTDS: 55, supportedProvinces: ['ON', 'BC', 'AB', 'QC'], propertyTypes: ['residential', 'condo', 'commercial'], baseRate: 6.49, speed: 7, exceptionsTolerance: 9, appetite: 6, pricingPremium: 0.75, documentRequirements: ['T4 Slips', 'Bank Statements'] },
    { name: 'Bridgewater Bank', minCreditScore: 620, maxLTV: 80, maxGDS: 39, maxTDS: 44, supportedProvinces: ['AB', 'BC', 'ON'], propertyTypes: ['residential', 'condo'], baseRate: 5.39, speed: 6, exceptionsTolerance: 5, appetite: 5, pricingPremium: 0.1, documentRequirements: ['T4 Slips', 'Notice of Assessment', 'Pay Stubs', 'Letter of Employment', 'Bank Statements', 'Photo ID', 'Proof of Down Payment'] },
];

const STAGES = ['intake', 'submitted', 'approved', 'funded', 'closed'];
const EMPLOYMENT = ['employed', 'self-employed', 'retired'];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randBetween(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function main() {
    console.log('🌱 Seeding BrokerBox database...');

    // Clean
    await prisma.documentFile.deleteMany();
    await prisma.docRequest.deleteMany();
    await prisma.scenario.deleteMany();
    await prisma.deal.deleteMany();
    await prisma.borrower.deleteMany();
    await prisma.lender.deleteMany();
    await prisma.auditLog.deleteMany();

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
                employmentStatus: rand(EMPLOYMENT),
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

        const deal = await prisma.deal.create({
            data: {
                borrowerId: borrower.id,
                lenderId: stage === 'approved' || stage === 'funded' ? lender.id : null,
                stage,
                propertyAddress: `${rand(STREETS)}, ${loc.city}, ${loc.prov}`,
                propertyType: rand(['residential', 'condo', 'commercial']),
                propertyValue: propValue,
                loanAmount: loanAmt,
                interestRate: lender.baseRate + lender.pricingPremium,
                termMonths: rand([60, 120, 180, 240, 300]),
                ltv: +ltv.toFixed(1),
                matchScore: stage !== 'intake' ? randBetween(40, 95) : null,
            },
        });
        dealRecords.push(deal);
        await prisma.auditLog.create({ data: { actor: 'demo', entity: 'Deal', entityId: deal.id, action: 'CREATE' } });
    }
    console.log(`  ✓ ${dealRecords.length} deals`);

    // Doc Requests
    const DOC_TYPES = ['T4 Slips', 'Notice of Assessment', 'Pay Stubs', 'Letter of Employment', 'Bank Statements', 'Photo ID', 'Property Appraisal'];
    let docCount = 0;
    for (let i = 0; i < 12; i++) {
        const borrower = borrowerRecords[i % borrowerRecords.length];
        await prisma.docRequest.create({
            data: {
                borrowerId: borrower.id,
                docType: rand(DOC_TYPES),
                status: rand(['requested', 'uploaded', 'verified', 'rejected']),
            },
        });
        docCount++;
    }
    console.log(`  ✓ ${docCount} doc requests`);

    console.log('✅ Seed complete!');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
