import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const body = await req.json();

        const { data: oldUser } = await supabase.from('User').select('*').eq('id', resolvedParams.id).single();
        if (!oldUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const dataToUpdate: any = {};
        if (body.role !== undefined) dataToUpdate.role = body.role;
        if (body.baseCommissionSplit !== undefined) dataToUpdate.baseCommissionSplit = Number(body.baseCommissionSplit);

        const { data: updatedUser, error } = await supabase.from('User').update(dataToUpdate).eq('id', resolvedParams.id).select().single();
        if (error) throw error;

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
