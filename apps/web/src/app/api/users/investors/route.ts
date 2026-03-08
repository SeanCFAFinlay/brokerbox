import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    const investors = await prisma.user.findMany({
        where: { role: 'investor' },
        select: { id: true, name: true, email: true }
    });
    return NextResponse.json(investors);
}
