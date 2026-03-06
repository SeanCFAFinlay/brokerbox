import { prisma } from '../../lib/prisma';

export async function GET(request: Request) {
    try {
        const clients = await prisma.client.findMany({
            include: {
                deals: { include: { deal: true } },
                properties: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return Response.json({ clients });
    } catch (e) {
        console.error(e);
        return Response.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }
}
