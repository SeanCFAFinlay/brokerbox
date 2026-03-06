import { prisma } from '../../lib/prisma';

export async function GET(request: Request) {
    try {
        const deals = await prisma.deal.findMany({
            include: { parties: { include: { client: true } } },
            orderBy: { createdAt: 'desc' }
        });
        return Response.json({ deals });
    } catch (e) {
        console.error(e);
        return Response.json({ error: 'Failed to fetch deals' }, { status: 500 });
    }
}
