import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const { data: lenders, error } = await supabase
            .from('Lender')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return NextResponse.json(lenders ?? []);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch lenders' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { data: lender, error } = await supabase
            .from('Lender')
            .insert(body)
            .select()
            .single();

        if (error) throw error;

        await logAudit('Lender', lender.id, 'CREATE');
        return NextResponse.json(lender, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to create lender' }, { status: 500 });
    }
}
