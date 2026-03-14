import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) {
        return NextResponse.json({ error: 'entityType and entityId are required' }, { status: 400 });
    }

    const logs = await prisma.dealActivity.findMany({
        where: { entity: entityType, entityId },
        orderBy: { timestamp: 'desc' },
        take: 50
    });

    return NextResponse.json(logs);
}
