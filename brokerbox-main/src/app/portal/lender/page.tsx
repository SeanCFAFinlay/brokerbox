import Link from 'next/link';
import s from '@/styles/shared.module.css';
import { getAdminClient, rowToApp, rowsToApp } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function LenderDashboard() {
  const supabase = getAdminClient();
  const { data: lenderRow } = await supabase
    .from('lender')
    .select('*, deal(*, borrower(*))')
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
  if (!lenderRow) {
    return <div style={{ padding: 40 }}><h2>No Lenders Found</h2><p>Please create a lender in the Broker CRM first.</p><Link href="/lenders">Go to Lenders</Link></div>;
  }
  const lender = rowToApp(lenderRow as Record<string, unknown>) as Record<string, unknown>;
  const deals = (lender.deal ? (Array.isArray(lender.deal) ? lender.deal : [lender.deal]) : []) as { stage: string; loanAmount: number }[];
  const activeDeals = deals.filter((d) => ['committed', 'in_review', 'matched'].includes(d.stage));
  const fundedDeals = deals.filter((d) => d.stage === 'funded');
  const totalPipeline = activeDeals.reduce((sum, d) => sum + d.loanAmount, 0);
  const totalFunded = fundedDeals.reduce((sum, d) => sum + d.loanAmount, 0);
  const capitalAvailable = (lender.capitalAvailable as number) ?? 0;
  const utilization = capitalAvailable > 0 ? (totalFunded / capitalAvailable) * 100 : 0;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
      <div className={s.pageHeader}>
        <div>
          <h1>Welcome, {lender.name as string}</h1>
          <p>Pipeline: ${(totalPipeline / 1e6).toFixed(2)}M · Funded: ${(totalFunded / 1e6).toFixed(2)}M · Utilization: {utilization.toFixed(1)}%</p>
        </div>
      </div>
      <div className={s.kpiRow}>
        <div className={s.kpiCard}><div className={s.kpiLabel}>Active Deals</div><div className={s.kpiValue}>{activeDeals.length}</div></div>
        <div className={s.kpiCard}><div className={s.kpiLabel}>Funded</div><div className={s.kpiValue}>{fundedDeals.length}</div></div>
      </div>
      <p><Link href="/portal/lender/deals" className={s.btn}>View pipeline</Link></p>
    </div>
  );
}
