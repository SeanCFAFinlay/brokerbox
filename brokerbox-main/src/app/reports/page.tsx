import s from '@/styles/shared.module.css';
import { pipelineVolume, fundedVolume, closeRate, avgDaysToFund } from '@/lib/domain';
import { getAdminClient, rowsToApp } from '@/lib/db';
import ReportsClient from './ReportsClient';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const supabase = getAdminClient();
  const [dealsRes, lendersRes, borrowersRes] = await Promise.all([
    supabase.from('deal').select('*, borrower(*), lender(*)'),
    supabase.from('lender').select('*'),
    supabase.from('borrower').select('*'),
  ]);
  const deals = rowsToApp((dealsRes.data ?? []) as Record<string, unknown>[]);
  const lenders = rowsToApp((lendersRes.data ?? []) as Record<string, unknown>[]);
  const borrowers = rowsToApp((borrowersRes.data ?? []) as Record<string, unknown>[]);

  const dealDtos = (deals as { id: string; stage: string; loanAmount: number; createdAt: unknown; fundingDate: unknown; totalRevenue: unknown; netBrokerageRevenue: unknown; brokerFee: unknown }[]).map((d) => ({
    id: d.id,
    stage: d.stage,
    loanAmount: d.loanAmount,
    createdAt: d.createdAt,
    fundingDate: d.fundingDate,
    totalRevenue: d.totalRevenue,
    netBrokerageRevenue: d.netBrokerageRevenue,
    brokerFee: d.brokerFee,
  }));
  const totalPipeline = pipelineVolume(dealDtos);
  const totalFundedVol = fundedVolume(dealDtos);
  const closeRatePct = closeRate(dealDtos);
  const avgDays = avgDaysToFund(dealDtos);
  const funded = (deals as { stage: string }[]).filter((d) => d.stage === 'funded');
  const active = (deals as { stage: string }[]).filter((d) => ['intake', 'in_review', 'matched', 'committed'].includes(d.stage));

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
      year: d.getFullYear(),
      month: d.getMonth(),
    };
  }).reverse();

  const fundedWithAmount = funded as { fundingDate?: string; updatedAt?: string; loanAmount?: number }[];
  const monthlyVolume = months.map((m) => {
    const monthDeals = fundedWithAmount.filter((d) => {
      const fd = new Date((d.fundingDate || d.updatedAt) as string || 0);
      return fd.getFullYear() === m.year && fd.getMonth() === m.month;
    });
    return {
      label: m.label,
      volume: monthDeals.reduce((sum, d) => sum + (d.loanAmount ?? 0), 0),
    };
  });

  const { data: auditData } = await supabase
    .from('deal_activity')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(100);
  const auditRows = rowsToApp((auditData ?? []) as Record<string, unknown>[]) as { id: string; timestamp: string; actor: string; entity: string; entityId: string; action: string; diff: unknown }[];
  const auditLogs = auditRows.map((l) => ({ ...l, timestamp: new Date(l.timestamp) }));

  return (
    <div style={{ padding: '0 20px', maxWidth: 1400, margin: '0 auto' }}>
      <div className={s.pageHeader}>
        <h1>Reports & Analytics</h1>
        <p>Pipeline, close rates, and revenue metrics</p>
      </div>
      <ReportsClient
        deals={deals as { id: string; stage: string; loanAmount: number; propertyType: string; createdAt: string; fundingDate: string | null; lender?: { name: string } | null; borrower: { firstName: string; lastName: string }; totalRevenue: number | null; agentCommissionSplit: number; netBrokerageRevenue: number | null }[]}
        auditLogs={auditLogs}
        totalBorrowers={Array.isArray(borrowers) ? borrowers.length : 0}
      />
    </div>
  );
}