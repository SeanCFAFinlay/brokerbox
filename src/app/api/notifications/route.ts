import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20
    });

    return NextResponse.json(notifications);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const notification = await prisma.notification.create({ data: body });
        return NextResponse.json(notification, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, read } = body;
        const notification = await prisma.notification.update({
            where: { id },
            data: { read }
        });
        return NextResponse.json(notification);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}
