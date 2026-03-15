import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';
import { parseBody } from '@/lib/api';
import { createBorrowerSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const { data: borrowers, error } = await supabase
            .from('Borrower')
            .select('*')
            .order('updatedAt', { ascending: false });

        if (error) throw error;
        return NextResponse.json(borrowers ?? []);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch borrowers' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const raw = await req.json();
        const parsed = parseBody(createBorrowerSchema, raw);
        if (parsed.success === false) return parsed.response;
        
        const { data: borrower, error } = await supabase
            .from('Borrower')
            .insert(parsed.data)
            .select()
            .single();

        if (error) throw error;

        await logAudit('Borrower', borrower.id, 'CREATE');
        return NextResponse.json(borrower, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to create borrower' }, { status: 500 });
    }
}
