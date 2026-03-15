import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        const { data: old, error: fetchError } = await supabase.from('Scenario').select('*').eq('id', id).single();
        if (fetchError || !old) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const { data: scenario, error: updateError } = await supabase.from('Scenario').update(body).eq('id', id).select().single();
        if (updateError) throw updateError;

        // Audit difference
        const diff: Record<string, { old: any; new: any }> = {};
        for (const key of Object.keys(body)) {
            if ((old as any)[key] !== body[key]) {
                diff[key] = { old: (old as any)[key], new: body[key] };
            }
        }

        await logAudit('Scenario', id, 'UPDATE', diff);
        return NextResponse.json(scenario);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error } = await supabase.from('Scenario').delete().eq('id', id);
        if (error) throw error;

        await logAudit('Scenario', id, 'DELETE');
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
