import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { data: borrower, error } = await supabase
            .from('Borrower')
            .select('*, deals:Deal(*, lender:Lender(*)), scenarios:Scenario(*), docRequests:DocRequest(*, files:DocumentFile(*))')
            .eq('id', id)
            .single();

        if (error || !borrower) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(borrower);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch borrower' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        
        const { data: old } = await supabase.from('Borrower').select('*').eq('id', id).single();
        const { data: borrower, error } = await supabase.from('Borrower').update(body).eq('id', id).select().single();
        
        if (error) throw error;

        const diff: Record<string, { old: unknown; new: unknown }> = {};
        for (const key of Object.keys(body)) {
            if (old && (old as Record<string, unknown>)[key] !== body[key]) {
                diff[key] = { old: (old as Record<string, unknown>)[key], new: body[key] };
            }
        }
        await logAudit('Borrower', id, 'UPDATE', diff);
        return NextResponse.json(borrower);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error } = await supabase.from('Borrower').delete().eq('id', id);
        if (error) throw error;
        
        await logAudit('Borrower', id, 'DELETE');
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
