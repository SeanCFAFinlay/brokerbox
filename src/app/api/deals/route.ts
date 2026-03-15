import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';
import { parseBody } from '@/lib/api';
import { createDealSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const { data: deals, error } = await supabase
            .from('Deal')
            .select('*, borrower:Borrower(*), lender:Lender(*)')
            .order('updatedAt', { ascending: false });

        if (error) throw error;
        return NextResponse.json(deals ?? []);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const raw = await req.json();
        const parsed = parseBody(createDealSchema, raw);
        if (parsed.success === false) return parsed.response;
        
        const data = { ...parsed.data };
        if (typeof data.propertyValue === 'number' && typeof data.loanAmount === 'number') {
            (data as any).ltv = (data.loanAmount / data.propertyValue) * 100;
        }

        const { data: deal, error } = await supabase
            .from('Deal')
            .insert(data)
            .select()
            .single();

        if (error) throw error;

        await logAudit('Deal', deal.id, 'CREATE');
        return NextResponse.json(deal, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
    }
}
