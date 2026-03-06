import { prisma } from '../../../lib/prisma';

export async function GET(request: Request, { id }: { id: string }) {
    try {
        const deal = await prisma.deal.findUnique({
            where: { id },
            include: {
                parties: { include: { client: { include: { contacts: true } } } },
                property: true,
                scenarios: { include: { tranches: true } },
                matches: { include: { lender: true } },
                notes: true,
                tasks: true,
                documents: true,
            }
        });

        if (!deal) return Response.json({ error: 'Not found' }, { status: 404 });

        return Response.json({ deal });
    } catch (e) {
        console.error(e);
        return Response.json({ error: 'Failed' }, { status: 500 });
    }
}
