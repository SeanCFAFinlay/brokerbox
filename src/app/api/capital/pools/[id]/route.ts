import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Calculate utilization rate if amounts are provided
        if (body.totalAmount !== undefined || body.availableAmount !== undefined) {
            const { data: current } = await supabase.from('CapitalPool').select('totalAmount, availableAmount').eq('id', id).single();
            const total = body.totalAmount ?? current?.totalAmount;
            const available = body.availableAmount ?? current?.availableAmount;
            if (total) {
                body.utilizationRate = (total - (available || 0)) / total * 100;
            }
        }

        const { data: pool, error } = await supabase.from('CapitalPool').update(body).eq('id', id).select().single();
        if (error) throw error;

        await logAudit('CapitalPool', id, 'UPDATE', body);
        return NextResponse.json(pool);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error } = await supabase.from('CapitalPool').delete().eq('id', id);
        if (error) throw error;

        await logAudit('CapitalPool', id, 'DELETE');
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
