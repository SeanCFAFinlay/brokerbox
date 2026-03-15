import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { data: lender, error } = await supabase.from('Lender').select('*, deals:Deal(*)').eq('id', id).single();
        if (error || !lender) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(lender);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch lender' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        
        const { data: old } = await supabase.from('Lender').select('*').eq('id', id).single();
        const { data: lender, error } = await supabase.from('Lender').update(body).eq('id', id).select().single();
        
        if (error) throw error;

        const diff: Record<string, { old: unknown; new: unknown }> = {};
        for (const key of Object.keys(body)) {
            if (old && (old as Record<string, unknown>)[key] !== body[key]) {
                diff[key] = { old: (old as Record<string, unknown>)[key], new: body[key] };
            }
        }
        await logAudit('Lender', id, 'UPDATE', diff);
        return NextResponse.json(lender);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error } = await supabase.from('Lender').delete().eq('id', id);
        if (error) throw error;
        
        await logAudit('Lender', id, 'DELETE');
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
