import { supabase } from '@/lib/supabase';
import s from '@/styles/shared.module.css';
import Link from 'next/link';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { PipelineCommandCenter } from '@/components/dashboard/PipelineCommandCenter';
import { ActionItems } from '@/components/dashboard/ActionItems';
import TaskList from '@/components/TaskList';
import { getNextBestActions, pipelineVolume, fundedVolume, closeRate, avgDaysToFund } from '@/lib/domain';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [
    { data: dealsData },
    { data: borrowersData },
    { data: tasksData },
    { data: docRequestsData },
    { data: recentLogsData },
    { data: lendersData },
  ] = await Promise.all([
    supabase.from('Deal').select('id, stage, loanAmount, propertyValue, borrowerId, lenderId, updatedAt, createdAt, fundingDate, closingDate, totalRevenue, netBrokerageRevenue, brokerFee, ltv').order('updatedAt', { ascending: false }).limit(200),
    supabase.from('Borrower').select('id, firstName, lastName, updatedAt, status').eq('status', 'active'),
    supabase.from('Task').select('*').eq('status', 'pending').order('dueDate', { ascending: true }).limit(50),
    supabase.from('DocRequest').select('id, borrowerId, dealId, status, createdAt, docType').eq('status', 'requested').order('createdAt', { ascending: false }).limit(10),
    supabase.from('DealActivity').select('*').order('timestamp', { ascending: false }).limit(8),
    supabase.from('Lender').select('id, name').limit(50),
  ]);

  const deals = Array.isArray(dealsData) ? dealsData : [];
  const borrowers = Array.isArray(borrowersData) ? borrowersData : [];
  const tasks = Array.isArray(tasksData) ? tasksData : [];
  const docRequests = Array.isArray(docRequestsData) ? docRequestsData : [];
  const recentLogs = Array.isArray(recentLogsData) ? recentLogsData : [];
  const lenders = Array.isArray(lendersData) ? lendersData : [];

  // ── KPI Calculations ──
  const dealDtos = deals.map((d: any) => ({
    id: d.id, stage: d.stage, loanAmount: d.loanAmount, createdAt: d.createdAt,
    fundingDate: d.fundingDate, totalRevenue: d.totalRevenue,
    netBrokerageRevenue: d.netBrokerageRevenue, brokerFee: d.brokerFee,
  }));
  const totalPipeline = pipelineVolume(dealDtos);
  const totalFunded = fundedVolume(dealDtos);
  const closeRatePct = closeRate(dealDtos);
  const avgDays = avgDaysToFund(dealDtos);

  // ── NBA (Next-Best-Actions) ──
  const nbaActions = getNextBestActions(
    borrowers.map(b => ({ id: b.id, updatedAt: b.updatedAt })),
    deals.map(d => ({ id: d.id, borrowerId: d.borrowerId, stage: d.stage, updatedAt: d.updatedAt })),
    tasks.map(t => ({ id: t.id, dueDate: t.dueDate, status: t.status, dealId: t.dealId })),
    docRequests.map(d => ({ id: d.id, borrowerId: d.borrowerId, dealId: d.dealId, status: d.status, createdAt: d.createdAt }))
  );

  const actionItems = nbaActions.slice(0, 5).map((a) => ({
    id: `${a.entityId}-${a.type}`,
    type: 'system_alert' as const,
    title: a.title,
    subtitle: a.reason,
    date: new Date(),
    href: a.href ?? '#',
  }));

  // ── Upcoming Closings (next 14 days) ──
  const now = new Date();
  const twoWeeks = new Date(); twoWeeks.setDate(twoWeeks.getDate() + 14);
  const upcomingClosings = deals
    .filter((d: any) => d.closingDate && d.stage !== 'funded' && new Date(d.closingDate) >= now && new Date(d.closingDate) <= twoWeeks)
    .slice(0, 5);

  // ── Recent Funded ──
  const recentFunded = deals.filter((d: any) => d.stage === 'funded').slice(0, 3);

  return (
    <main className={s.page}>
      <div className={s.pageHeader}>
        <h1>Broker Command Center</h1>
        <p>Real-time Pipeline Intelligence & Asset Management</p>
      </div>

      {/* ── Quick Actions ── */}
      <QuickActions />

      {/* ── Executive KPIs ── */}
      <div className={s.kpiRow} style={{ marginTop: 24 }}>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Pipeline Volume</div>
          <div className={s.kpiValue} style={{ color: 'var(--bb-accent)' }}>${(totalPipeline / 1e6).toFixed(2)}M</div>
          <div className={s.kpiSub}>{deals.length} active deals</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Funded Volume</div>
          <div className={s.kpiValue} style={{ color: 'var(--bb-success)' }}>${(totalFunded / 1e6).toFixed(2)}M</div>
          <div className={s.kpiSub}>Closed & funded</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Close Rate</div>
          <div className={s.kpiValue}>{closeRatePct != null ? `${closeRatePct}%` : '—'}</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Avg Days to Fund</div>
          <div className={s.kpiValue}>{avgDays != null ? `${avgDays}d` : '—'}</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Active Borrowers</div>
          <div className={s.kpiValue}>{borrowers.length}</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Lender Network</div>
          <div className={s.kpiValue}>{lenders.length}</div>
        </div>
      </div>

      {/* ── Pipeline Chart ── */}
      <div style={{ marginTop: 24 }}>
        <PipelineCommandCenter deals={deals} />
      </div>

      {/* ── Two-column: Actions + Activity ── */}
      <div className={s.grid2} style={{ marginTop: 24 }}>
        <div className={s.card}>
          <div className={s.cardTitle}>Action Items</div>
          <ActionItems items={actionItems} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Upcoming Closings */}
          <div className={s.card}>
            <div className={s.cardTitle}>Upcoming Closings (14 Days)</div>
            {upcomingClosings.length === 0 ? (
              <div style={{ color: 'var(--bb-muted)', fontSize: 13, padding: '16px 0' }}>No imminent closings scheduled.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcomingClosings.map((d: any) => (
                  <Link key={d.id} href={`/deals/${d.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--bb-border)', textDecoration: 'none', color: 'var(--bb-text)', fontSize: 13 }}>
                    <span style={{ fontWeight: 600 }}>${(d.loanAmount || 0).toLocaleString()}</span>
                    <span style={{ color: 'var(--bb-danger)', fontWeight: 600, fontSize: 12 }}>
                      {new Date(d.closingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className={s.card}>
            <div className={s.cardTitle}>Recent Activity</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentLogs.length === 0 ? (
                <div style={{ color: 'var(--bb-muted)', fontSize: 13 }}>No recent activity.</div>
              ) : recentLogs.map((log: any) => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--bb-text-secondary)' }}>
                  <span><strong>{log.action}</strong> {log.entity}</span>
                  <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tasks ── */}
      <div className={s.card} style={{ marginTop: 24 }}>
        <TaskList />
      </div>
    </main>
  );
}
