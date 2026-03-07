export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) {
        return NextResponse.json({ error: 'entityType and entityId required' }, { status: 400 });
    }

    const notes = await prisma.note.findMany({
        where: { entityType, entityId },
        orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { entityType, entityId, content, createdBy } = body;

    if (!entityType || !entityId || !content) {
        return NextResponse.json({ error: 'entityType, entityId, and content required' }, { status: 400 });
    }

    const note = await prisma.note.create({
        data: { entityType, entityId, content, createdBy: createdBy || 'broker' },
    });
    return NextResponse.json(note, { status: 201 });
}
