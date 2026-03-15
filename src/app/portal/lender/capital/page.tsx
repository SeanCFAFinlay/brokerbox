import { supabase } from '@/lib/supabase';
import s from '@/styles/shared.module.css';
import { CapitalPoolManager } from '@/components/lender/CapitalPoolManager';

export const dynamic = 'force-dynamic';

export default async function LenderCapitalPage() {
    // Auth validation mock: pick the first active lender
    const { data: lender, error } = await supabase
        .from('Lender')
        .select('*, capitalPools:CapitalPool(*)')
        .eq('status', 'active')
        .limit(1)
        .single();

    if (error || !lender) return <div style={{ padding: 40 }}><h2>Lender Access Restricted</h2></div>;

    const pools = (lender.capitalPools as any[] || []).map(p => ({
        ...p,
        utilizationRate: p.utilizationRate || 0
    }));

    // Manual sort
    pools.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
            <div className={s.pageHeader}>
                <div>
                    <h1>Lending Capital & Pools</h1>
                    <p>Strategic management of {lender.name}'s capital lifecycle and utilization.</p>
                </div>
            </div>

            <CapitalPoolManager initialPools={pools as any} lenderId={lender.id} />
        </div>
    );
}
