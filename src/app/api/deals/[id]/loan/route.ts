import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        const body = await req.json();

        const { data: deal, error: dealError } = await supabase.from('Deal').select('*, lender:Lender(*)').eq('id', id).single();
        if (dealError || !deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 });

        // Ensure we don't accidentally fund twice
        const { data: existingLoan } = await supabase.from('Loan').select('id').eq('dealId', id).maybeSingle();
        if (existingLoan) return NextResponse.json({ error: 'Loan already exists' }, { status: 400 });

        const principal = Number(body.principalBalance) || deal.loanAmount;
        const poolId = body.poolId;

        // Note: No native transaction here in client SDK, using sequential logic
        // 1. Create the Loan record
        const { data: newLoan, error: loanError } = await supabase.from('Loan').insert({
            dealId: id,
            poolId: poolId || null,
            status: 'active',
            fundedDate: new Date(body.fundedDate || Date.now()).toISOString(),
            maturityDate: new Date(body.maturityDate).toISOString(),
            principalBalance: principal,
            interestRate: Number(body.interestRate) || deal.interestRate || 0,
            interestType: body.interestType || 'fixed'
        }).select().single();

        if (loanError) throw loanError;

        // 2. Update Deal stage
        await supabase.from('Deal').update({ stage: 'funded' }).eq('id', id);

        // 3. If a capital pool is used, deduct the principal
        if (poolId) {
            const { data: pool } = await supabase.from('CapitalPool').select('*').eq('id', poolId).single();
            if (pool) {
                const newAvailable = pool.availableAmount - principal;
                await supabase.from('CapitalPool').update({
                    availableAmount: newAvailable,
                    utilizationRate: ((pool.totalAmount - newAvailable) / pool.totalAmount) * 100
                }).eq('id', poolId);

                // 4. Update Lender total capitalAvailable (sum of pools)
                const { data: lenderPools } = await supabase.from('CapitalPool').select('availableAmount').eq('lenderId', pool.lenderId);
                const totalLenderAvailable = (lenderPools || []).reduce((sum, p) => sum + p.availableAmount, 0);

                await supabase.from('Lender').update({ capitalAvailable: totalLenderAvailable }).eq('id', pool.lenderId);
            }
        } else if (deal.lenderId) {
            // Decement general capital
            const { data: currentLender } = await supabase.from('Lender').select('capitalAvailable').eq('id', deal.lenderId).single();
            if (currentLender) {
                await supabase.from('Lender').update({ capitalAvailable: currentLender.capitalAvailable - principal }).eq('id', deal.lenderId);
            }
        }

        await logAudit('Loan', newLoan.id, 'CREATE', undefined, { transactional: false });
        await logAudit('Deal', id, 'STATUS_CHANGE', { stage: { old: deal.stage as string, new: 'funded' } });

        // Add to stage history
        await supabase.from('DealStageHistory').insert({
            dealId: id,
            fromStage: deal.stage,
            toStage: 'funded',
            changedBy: 'broker'
        });

        // Auto-sync to Outlook if enabled
        try {
            const { syncToOutlook } = await import('@/lib/outlook');
            await syncToOutlook('demo');
        } catch (e) {
            console.error('Outlook sync failed:', e);
        }

        return NextResponse.json(newLoan, { status: 201 });
    } catch (error: any) {
        console.error('Funding Failed:', error);
        return NextResponse.json({ error: error.message || 'Funding failed' }, { status: 500 });
    }
}
