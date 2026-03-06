import { prisma } from '../../lib/prisma';

export async function GET(request: Request) {
    try {
        const lenders = await prisma.lender.findMany({
            include: {
                products: true,
                criteria: {
                    orderBy: { version: 'desc' },
                    take: 1
                }
            },
            orderBy: { name: 'asc' }
        });
        return Response.json({ lenders });
    } catch (e) {
        console.error(e);
        return Response.json({ error: 'Failed to fetch lenders' }, { status: 500 });
    }
}
