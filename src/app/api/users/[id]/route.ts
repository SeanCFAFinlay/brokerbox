import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const body = await req.json();

        const oldUser = await prisma.user.findUnique({ where: { id: resolvedParams.id } });
        if (!oldUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const dataToUpdate: any = {};
        if (body.role !== undefined) dataToUpdate.role = body.role;
        if (body.baseCommissionSplit !== undefined) dataToUpdate.baseCommissionSplit = Number(body.baseCommissionSplit);

        const updatedUser = await prisma.user.update({
            where: { id: resolvedParams.id },
            data: dataToUpdate
        });

        const diff: Record<string, { old: any, new: any }> = {};
        if (body.role !== undefined && body.role !== oldUser.role) diff.role = { old: oldUser.role, new: body.role };
        if (body.baseCommissionSplit !== undefined && Number(body.baseCommissionSplit) !== oldUser.baseCommissionSplit) diff.baseCommissionSplit = { old: oldUser.baseCommissionSplit, new: Number(body.baseCommissionSplit) };

        await logAudit('User', updatedUser.id, 'UPDATE', diff);

        return NextResponse.json(updatedUser);
    } catch (error: any) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
