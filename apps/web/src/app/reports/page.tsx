import prisma from '@/lib/prisma';
import ReportsClient from './ReportsClient';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    const [auditLogs, deals, totalBorrowers] = await Promise.all([
        prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' }, take: 200 }),
        prisma.deal.findMany({ include: { borrower: true, lender: true } }),
        prisma.borrower.count(),
    ]);

    return (
        <ReportsClient
            deals={deals as any}
            auditLogs={auditLogs as any}
            totalBorrowers={totalBorrowers}
        />
    );
}
