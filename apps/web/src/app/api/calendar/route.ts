import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const events = await prisma.calendarEvent.findMany({
        where: { status: 'active' },
        orderBy: { startTime: 'asc' }
    });
    return NextResponse.json(events);
}
