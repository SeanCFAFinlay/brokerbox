import Link from 'next/link';
import s from '@/styles/shared.module.css';
import { CapitalPoolManager } from '@/components/lender/CapitalPoolManager';
import { getAdminClient, rowToApp } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function LenderCapitalPage() {
  const supabase = getAdminClient();
  const { data: lenderRow } = await supabase
    .from('lender')
    .select('*, capital_pool(*)')
    .eq('status', 'active')
    .limit(1)
    .single();
  if (!lenderRow) return <div style={{ padding: 40 }}><h2>Lender Access Restricted</h2></div>;
  const lender = rowToApp(lenderRow as Record<string, unknown>) as Record<string, unknown>;
  const rawPools = (lender.capitalPool ? (Array.isArray(lender.capitalPool) ? lender.capitalPool : [lender.capitalPool]) : []) as Record<string, unknown>[];
  const pools = rawPools.map((p) => ({
    ...p,
    id: p.id as string,
    name: (p.name ?? 'Pool') as string,
    totalAmount: Number(p.totalAmount ?? p.total_amount ?? 0),
    availableAmount: Number(p.availableAmount ?? p.available_amount ?? 0),
    effectiveLTV: Number(p.effectiveLTV ?? p.effective_ltv ?? 75),
    utilizationRate: Number(p.utilizationRate ?? p.utilization_rate ?? 0),
    targetYield: Number(p.targetYield ?? p.target_yield ?? 0),
    status: (p.status ?? 'active') as string,
    lenderId: (p.lenderId ?? p.lender_id ?? lender.id) as string,
  }));
  const totalManaged = pools.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalAvailable = pools.reduce((sum, p) => sum + p.availableAmount, 0);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
      <div className={s.pageHeader}>
        <div>
          <h1>Lending Capital & Pools</h1>
          <p>Strategic management of {lender.name as string}&apos;s capital lifecycle and utilization.</p>
        </div>
      </div>
      <CapitalPoolManager initialPools={pools as Parameters<typeof CapitalPoolManager>[0]['initialPools']} lenderId={lender.id as string} />
    </div>
  );
}
