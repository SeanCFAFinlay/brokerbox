import { prisma } from '../../lib/prisma';

export async function GET(request: Request) {
    try {
        const dealsCount = await prisma.deal.count();

        // Hardcoding some derived metrics for the scaffold since we don't have historical data
        const kpis = {
            activeDeals: dealsCount,
            capitalAvailable: 850000000,
            fundedMtd: 12500000,
            avgDaysToFund: 22,
            closeRate: 68
        };

        const activities = await prisma.activityFeed.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        const lenders = await prisma.lender.findMany({
            include: { capacities: true },
            take: 5
        });

        return Response.json({ kpis, activities, lenders });
    } catch (e) {
        console.error(e);
        return Response.json({ error: 'Failed to load dashboard data' }, { status: 500 });
    }
}
