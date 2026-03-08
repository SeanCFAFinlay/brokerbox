
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Running raw SQL seed...');
    await prisma.$executeRawUnsafe(`
        INSERT INTO "Lender" ("id", "name", "status", "updatedAt")
        VALUES ('test-raw-lender', 'Raw SQL Seeder', 'active', NOW())
        ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name";
    `);
    console.log('Seeded successfully!');
    await prisma.$disconnect();
}

main().catch(console.error);
