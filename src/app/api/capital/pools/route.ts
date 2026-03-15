import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data: pools, error } = await supabase
            .from('CapitalPool')
            .select('*, lender:Lender(*), investments:CapitalInvestment(*, user:User(*))')
            .order('createdAt', { ascending: false });

        if (error) throw error;
        return NextResponse.json(pools ?? []);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch capital pools' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Convert to numbers
        const totalAmount = Number(body.totalAmount);
        const availableAmount = Number(body.availableAmount) || totalAmount;
        const lenderId = body.lenderId;

        const { data: pool, error } = await supabase
            .from('CapitalPool')
            .insert({
                name: body.name,
                totalAmount,
                availableAmount,
                utilizationRate: ((totalAmount - availableAmount) / totalAmount) * 100,
                effectiveLTV: Number(body.effectiveLTV) || 75,
                minInvestment: Number(body.minInvestment) || 50000,
                targetYield: Number(body.targetYield) || 8.0,
                lenderId,
            })
            .select()
            .single();

        if (error) throw error;

        await logAudit('CapitalPool', pool.id, 'CREATE');

        // Also update the lender's capitalAvailable manually to sum up their pools
        const { data: allPools } = await supabase.from('CapitalPool').select('availableAmount').eq('lenderId', lenderId);
        const newCapital = (allPools || []).reduce((sum, p) => sum + p.availableAmount, 0);
        
        await supabase.from('Lender').update({ capitalAvailable: newCapital }).eq('id', lenderId);

        return NextResponse.json(pool, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to create capital pool' }, { status: 500 });
    }
}
