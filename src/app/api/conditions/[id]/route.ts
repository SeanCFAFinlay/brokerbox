import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const body = await req.json();

        const { data: oldCondition } = await supabase.from('DealCondition').select('*').eq('id', resolvedParams.id).single();

        // Auto-set clearedAt if status becomes 'met' or 'waived'
        let clearedAt = oldCondition?.clearedAt;
        if (body.status && body.status !== 'pending' && oldCondition?.status === 'pending') {
            clearedAt = new Date().toISOString();
        } else if (body.status === 'pending') {
            clearedAt = null;
        }

        const { data: condition, error } = await supabase.from('DealCondition').update({
            ...body,
            clearedAt
        }).eq('id', resolvedParams.id).select().single();

        if (error) throw error;

        const diff: Record<string, { old: any, new: any }> = {};
        if (body.status !== undefined && body.status !== oldCondition?.status) diff.status = { old: oldCondition?.status, new: body.status };
        if (body.description !== undefined && body.description !== oldCondition?.description) diff.description = { old: oldCondition?.description, new: body.description };

        await logAudit('DealCondition', condition.id, 'UPDATE', diff);

        return NextResponse.json(condition);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const { data: cond } = await supabase.from('DealCondition').select('id').eq('id', resolvedParams.id).maybeSingle();
        if (cond) {
            await supabase.from('DealCondition').delete().eq('id', resolvedParams.id);
            await logAudit('DealCondition', resolvedParams.id, 'DELETE');
        }
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
