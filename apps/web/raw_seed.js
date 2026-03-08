
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
    await client.connect();
    console.log('Connected to DB');

    // We'll just insert ONE lender to prove it works
    const res = await client.query(`
        INSERT INTO "Lender" ("id", "name", "status", "updatedAt")
        VALUES ('test-lender', 'Seeded via RAW SQL', 'active', NOW())
        ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name";
    `);
    console.log('Inserted/Updated lender:', res.rowCount);

    await client.end();
}

run().catch(console.error);
