export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { parseBody, handlePrismaError } from '@/lib/api';
import { createBorrowerSchema } from '@/lib/schemas';

export async function GET() {
    try {
        const borrowers = await prisma.borrower.findMany({ orderBy: { updatedAt: 'desc' } });
        return NextResponse.json(borrowers);
    } catch (err) {
        return handlePrismaError(err);
    }
}

export async function POST(req: NextRequest) {
    try {
        const raw = await req.json();
        const parsed = parseBody(createBorrowerSchema, raw);
        if (parsed.success === false) return parsed.response;
        const borrower = await prisma.borrower.create({ data: parsed.data as any });
        await logAudit('Borrower', borrower.id, 'CREATE');
        return NextResponse.json(borrower, { status: 201 });
    } catch (err) {
        return handlePrismaError(err);
    }
}
