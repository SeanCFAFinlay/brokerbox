import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';
import { parseBody, handleDatabaseError } from '@/lib/api';
import { updateDealSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { data: deal, error } = await supabase
            .from('Deal')
            .select('*, borrower:Borrower(*), lender:Lender(*), docRequests:DocRequest(*, files:DocumentFile(*)), stageHistory:DealStageHistory(*), scenarios:Scenario(*)')
            .eq('id', id)
            .single();

        if (error || !deal) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        
        // Manual sort as nested selects don't guarantee order
        if (deal.stageHistory) deal.stageHistory.sort((a: any, b: any) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
        if (deal.scenarios) deal.scenarios.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json(deal);
    } catch (err) {
        return handleDatabaseError(err);
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const raw = await req.json();
        const parsed = parseBody(updateDealSchema, raw);
        if (parsed.success === false) return parsed.response;
        const body = { ...parsed.data };
        const changedBy = body.changedBy ?? 'broker';
        const { changedBy: _drop, ...updateData } = body as typeof body & { changedBy?: string };
        
        if (typeof updateData.propertyValue === 'number' && typeof updateData.loanAmount === 'number') {
            (updateData as Record<string, unknown>).ltv = (updateData.loanAmount / updateData.propertyValue) * 100;
        }

        const { data: old, error: oldError } = await supabase.from('Deal').select('*').eq('id', id).single();
        if (oldError || !old) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        if (updateData.stage && updateData.stage !== old.stage) {
            await supabase.from('DealStageHistory').insert({
                dealId: id,
                fromStage: old.stage,
                toStage: updateData.stage,
                changedBy,
            });
        }

        const { data: deal, error: updateError } = await supabase.from('Deal').update(updateData).eq('id', id).select().single();
        if (updateError) throw updateError;

        const diff: Record<string, { old: unknown; new: unknown }> = {};
        for (const key of Object.keys(updateData)) {
            if ((old as Record<string, unknown>)[key] !== (updateData as Record<string, unknown>)[key]) {
                diff[key] = { old: (old as Record<string, unknown>)[key], new: (updateData as Record<string, unknown>)[key] };
            }
        }
        await logAudit('Deal', id, 'UPDATE', diff);
        return NextResponse.json(deal);
    } catch (err) {
        return handleDatabaseError(err);
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error } = await supabase.from('Deal').delete().eq('id', id);
        if (error) throw error;
        
        await logAudit('Deal', id, 'DELETE');
        return NextResponse.json({ ok: true });
    } catch (err) {
        return handleDatabaseError(err);
    }
}
