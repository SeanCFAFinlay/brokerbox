import { supabase } from '@/lib/supabase';
import s from '@/styles/shared.module.css';
import CapitalPoolClient from './CapitalPoolClient';

export const dynamic = 'force-dynamic';

export default async function CapitalPage() {
    const { data: poolsData } = await supabase
        .from('CapitalPool')
        .select('*, lender:Lender(*), investments:Investment(*, user:User(*))')
        .order('createdAt', { ascending: false });

    const pools = poolsData || [];
    const { data: activeLendersData } = await supabase.from('Lender').select('*').eq('status', 'active');
    const activeLenders = activeLendersData || [];
    const { data: investorsData } = await supabase.from('User').select('*').eq('role', 'investor');
    const investors = investorsData || [];

    const totalCapital = pools.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const activeCapital = pools.reduce((sum, p) => sum + (p.availableAmount || 0), 0);
    const deployedCapital = totalCapital - activeCapital;
    const utilization = totalCapital > 0 ? (deployedCapital / totalCapital) * 100 : 0;

    return (
        <div style={{ padding: '0 20px', maxWidth: 1400, margin: '0 auto' }}>
            <div className={s.pageHeader}>
                <div>
                    <h1>🏦 Capital & Investors</h1>
                    <p>Manage capital pools, investor commitments, and active pipeline deployments</p>
                </div>
            </div>

            <div className={s.kpiRow} style={{ marginBottom: 32 }}>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Total Pool Capital</div>
                    <div className={s.kpiValue}>${totalCapital.toLocaleString()}</div>
                </div>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Deployed</div>
                    <div className={s.kpiValue}>${deployedCapital.toLocaleString()}</div>
                </div>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Utilization</div>
                    <div className={s.kpiValue}>{utilization.toFixed(1)}%</div>
                </div>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Active Investors</div>
                    <div className={s.kpiValue}>{investors.length}</div>
                </div>
            </div>

            {/* Client Component handles Modals/Forms and state mapping */}
            <CapitalPoolClient initialPools={pools as any} lenders={activeLenders as any} investors={investors as any} />
        </div>
    );
}
