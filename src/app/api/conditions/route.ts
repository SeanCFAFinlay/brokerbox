import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const dealId = searchParams.get('dealId');

        if (!dealId) return NextResponse.json({ error: 'dealId required' }, { status: 400 });

        const { data: conditions, error } = await supabase
            .from('DealCondition')
            .select('*, docRequest:DocRequest(*)')
            .eq('dealId', dealId)
            .order('createdAt', { ascending: false });

        if (error) throw error;
        return NextResponse.json(conditions ?? []);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch conditions' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { data: condition, error } = await supabase
            .from('DealCondition')
            .insert({
                dealId: body.dealId,
                description: body.description,
                status: body.status || 'pending',
                docRequestId: body.docRequestId || null
            })
            .select()
            .single();

        if (error) throw error;

        await logAudit('DealCondition', condition.id, 'CREATE');
        return NextResponse.json(condition, { status: 201 });
    } catch (error: any) {
        console.error('Condition Create Error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
