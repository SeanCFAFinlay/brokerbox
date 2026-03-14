import s from '@/styles/shared.module.css';
import CapitalPoolClient from './CapitalPoolClient';
import { getAdminClient, rowsToApp } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function CapitalPage() {
  const supabase = getAdminClient();
  const { data: poolsData } = await supabase
    .from('capital_pool')
    .select('*, lender(*), investment(*, user(*))')
    .order('created_at', { ascending: false });
  const pools = rowsToApp((poolsData ?? []) as Record<string, unknown>[]);

  const { data: lendersData } = await supabase.from('lender').select('*').eq('status', 'active');
  const activeLenders = rowsToApp((lendersData ?? []) as Record<string, unknown>[]);

  const { data: investorsData } = await supabase.from('user').select('*').eq('role', 'investor');
  const investors = rowsToApp((investorsData ?? []) as Record<string, unknown>[]);

  const totalCapital = (pools as { totalAmount: number }[]).reduce((sum, p) => sum + p.totalAmount, 0);
  const activeCapital = (pools as { availableAmount: number }[]).reduce((sum, p) => sum + p.availableAmount, 0);
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

      <CapitalPoolClient initialPools={pools} lenders={activeLenders} investors={investors} />
    </div>
  );
}
