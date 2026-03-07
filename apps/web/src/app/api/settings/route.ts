export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET() {
    // @ts-expect-error Prisma Client may not immediately reflect schema changes
    let settings = await prisma.brokerageSettings.findUnique({ where: { id: 'default' } });
    if (!settings) {
        // @ts-expect-error
        settings = await prisma.brokerageSettings.create({
            data: { id: 'default', brokerageName: 'BrokerBox Financial Group' }
        });
    }
    return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
    const body = await req.json();
    // @ts-expect-error
    const old = await prisma.brokerageSettings.findUnique({ where: { id: 'default' } });

    // Convert numerical inputs
    ['defaultBrokerFee', 'defaultLenderFee', 'defaultTermMonths', 'defaultAmortMonths', 'defaultInterestRate'].forEach(k => {
        if (body[k] !== undefined) body[k] = Number(body[k]);
    });

    // @ts-expect-error
    const settings = await prisma.brokerageSettings.upsert({
        where: { id: 'default' },
        update: body,
        create: { id: 'default', ...body }
    });

    if (old) {
        const diff: any = {};
        for (const key of Object.keys(body)) {
            if ((old as any)[key] !== body[key]) diff[key] = { old: (old as any)[key], new: body[key] };
        }
        await logAudit('Settings', 'default', 'UPDATE', diff);
    } else {
        await logAudit('Settings', 'default', 'CREATE');
    }

    return NextResponse.json(settings);
}
