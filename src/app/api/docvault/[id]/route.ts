import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { data: doc, error } = await supabase.from('DocRequest').update(body).eq('id', id).select().single();
        if (error) throw error;
        
        await logAudit('DocRequest', id, 'UPDATE', { status: { old: '', new: body.status } });
        return NextResponse.json(doc);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
