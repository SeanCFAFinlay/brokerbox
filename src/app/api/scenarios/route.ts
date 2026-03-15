import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { computeScenario } from '@/lib/scenarioEngine';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
    try {
        const borrowerId = req.nextUrl.searchParams.get('borrowerId');
        const dealId = req.nextUrl.searchParams.get('dealId');

        let query = supabase.from('Scenario').select('*, deal:Deal(id, propertyAddress, loanAmount, loanPurpose)');

        if (borrowerId) query = query.eq('borrowerId', borrowerId);
        if (dealId) query = query.eq('dealId', dealId);

        const { data: scenarios, error } = await query.order('createdAt', { ascending: false });

        if (error) throw error;
        return NextResponse.json(scenarios ?? []);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch scenarios' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Ensure calculations are done/verified on backend
        if (body.type && body.inputs) {
            body.results = computeScenario(body.type, body.inputs);
            body.exitCost = body.results.exitCost;
        }

        const { data: scenario, error } = await supabase.from('Scenario').insert(body).select().single();
        if (error) throw error;

        await logAudit('Scenario', scenario.id, 'CREATE', undefined, { type: body.type }, 'Broker');
        return NextResponse.json(scenario, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to create scenario' }, { status: 500 });
    }
}
