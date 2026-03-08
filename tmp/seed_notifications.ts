import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // Find or create a demo user
    let user = await prisma.user.findFirst({ where: { email: 'broker@demo.com' } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                id: 'demo-user-id',
                email: 'broker@demo.com',
                name: 'Demo Broker',
                role: 'broker'
            }
        });
    }

    const notifications = [
        {
            userId: user.id,
            title: 'New Deal Matched',
            message: 'A new lender match is available for the Smith Refinance.',
            type: 'deal',
            link: '/deals'
        },
        {
            userId: user.id,
            title: 'Task Overdue',
            message: 'Property appraisal for 123 Main St is overdue.',
            type: 'warning',
            link: '/tasks'
        },
        {
            userId: user.id,
            title: 'Document Uploaded',
            message: 'Borrower Jane Doe uploaded "Paystub_2024.pdf".',
            type: 'success',
            link: '/docvault'
        }
    ];

    for (const n of notifications) {
        await prisma.notification.create({ data: n });
    }

    console.log('Seeded 3 notifications for user:', user.id);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
