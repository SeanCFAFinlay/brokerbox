import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const amount = Number(body.amount);
        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Valid investment amount is required' }, { status: 400 });
        }

        // Note: Sequential calls due to lack of client-side transactions
        const { data: pool, error: poolError } = await supabase.from('CapitalPool').select('*').eq('id', body.poolId).single();
        if (poolError || !pool) throw new Error('Pool not found');

        const { data: newInvestment, error: invError } = await supabase.from('Investment').insert({
            amount,
            yield: Number(body.yield) || pool.targetYield,
            poolId: body.poolId,
            userId: body.userId,
            status: 'active'
        }).select().single();

        if (invError) throw invError;

        // Adding an investment increases both total capacity and currently available dry powder
        const newTotal = pool.totalAmount + amount;
        const newAvailable = pool.availableAmount + amount;
        const newUtilization = ((newTotal - newAvailable) / (newTotal || 1)) * 100;

        await supabase.from('CapitalPool').update({
            totalAmount: newTotal,
            availableAmount: newAvailable,
            utilizationRate: newUtilization
        }).eq('id', body.poolId);

        // Also update the lender's total capital available summary
        const { data: lender } = await supabase.from('Lender').select('capitalAvailable').eq('id', pool.lenderId).single();
        if (lender) {
            await supabase.from('Lender').update({
                capitalAvailable: lender.capitalAvailable + amount
            }).eq('id', pool.lenderId);
        }

        await logAudit('Investment', newInvestment.id, 'CREATE', undefined, { amount });

        return NextResponse.json(newInvestment, { status: 201 });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message || 'Investment failed' }, { status: 500 });
    }
}
