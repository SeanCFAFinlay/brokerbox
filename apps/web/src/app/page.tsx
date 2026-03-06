import prisma from '@/lib/prisma';
import s from '@/styles/shared.module.css';
import { PipelineChart } from '@/components/dashboard/PipelineChart';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActionItems } from '@/components/dashboard/ActionItems';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [borrowerCount, lenderCount, dealCount, deals, docRequests, recentLogs] = await Promise.all([
    prisma.borrower.count(),
    prisma.lender.count(),
    prisma.deal.count(),
    prisma.deal.findMany({
      orderBy: { updatedAt: 'desc' }, take: 8,
      include: { borrower: true, lender: true },
    }),
    prisma.docRequest.findMany({
      where: { status: 'requested' },
      include: { borrower: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' }, take: 8 })
  ]);

  const funded = deals.filter(d => d.stage === 'funded');
  const totalVolume = funded.reduce((s, d) => s + d.loanAmount, 0);
  const pipeline = deals.filter(d => d.stage !== 'funded' && d.stage !== 'closed');

  const stages = ['intake', 'submitted', 'approved', 'funded', 'closed'];

  // Pipeline Chart Data
  const chartData = stages.map(st => {
    const stageDeals = deals.filter(d => d.stage === st);
    return {
      stage: st,
      count: stageDeals.length,
      volume: stageDeals.reduce((sum, d) => sum + d.loanAmount, 0)
    };
  });

  // Action Items Data
  const actionItems = docRequests.map((doc: any) => ({
    id: doc.id,
    type: 'doc_request' as const,
    title: `Missing: ${doc.docType}`,
    subtitle: `For ${doc.borrower.firstName} ${doc.borrower.lastName}`,
    date: doc.createdAt,
    href: `/borrowers/${doc.borrowerId}`
  }));

  return (
    <>
      <div className={s.pageHeader}>
        <h1>Dashboard</h1>
        <p>Welcome back — here&apos;s your mortgage pipeline at a glance.</p>
      </div>

      <QuickActions />

      <div className={s.kpiRow}>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Active Borrowers</div>
          <div className={s.kpiValue}>{borrowerCount}</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Active Lenders</div>
          <div className={s.kpiValue}>{lenderCount}</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Total Deals</div>
          <div className={s.kpiValue}>{dealCount}</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Pipeline Volume</div>
          <div className={s.kpiValue}>${(pipeline.reduce((s, d) => s + d.loanAmount, 0) / 1e6).toFixed(1)}M</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Funded Volume</div>
          <div className={s.kpiValue}>${(totalVolume / 1e6).toFixed(1)}M</div>
          <div className={s.kpiSub}>{funded.length} deals closed</div>
        </div>
      </div>

      <div className={s.grid2}>
        {/* Pipeline Chart */}
        <div className={s.card}>
          <div className={s.cardTitle}>Pipeline by Stage</div>
          <PipelineChart data={chartData} />
        </div>

        {/* Action Items */}
        <div className={s.card}>
          <div className={s.cardTitle}>Action Items</div>
          <ActionItems items={actionItems} />
        </div>
      </div>

      <div className={s.grid2} style={{ marginTop: 24 }}>
        {/* Recent Deals Table */}
        <div className={s.card}>
          <div className={s.cardTitle} style={{ marginBottom: 16 }}>Recent Deals</div>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Borrower</th>
                <th>Loan Amount</th>
                <th>Stage</th>
              </tr>
            </thead>
            <tbody>
              {deals.slice(0, 5).map(d => {
                const stageColor = d.stage === 'funded' ? s.pillGreen
                  : d.stage === 'approved' ? s.pillBlue
                    : d.stage === 'submitted' ? s.pillYellow
                      : d.stage === 'closed' ? s.pillGray
                        : s.pillGray;
                return (
                  <tr key={d.id}>
                    <td>{d.borrower.firstName} {d.borrower.lastName}</td>
                    <td>${d.loanAmount.toLocaleString()}</td>
                    <td><span className={`${s.pill} ${stageColor}`}>{d.stage}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Recent Activity */}
        <div className={s.card}>
          <div className={s.cardTitle} style={{ marginBottom: 16 }}>Recent Audit Log</div>
          {recentLogs.length === 0 ? (
            <div className={s.emptyState}>No audit events yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentLogs.map((log: any) => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--bb-text-secondary)', borderBottom: '1px solid var(--bb-border)', paddingBottom: 8 }}>
                  <span><strong>{log.action}</strong> {log.entity} #{log.entityId.slice(-6)}</span>
                  <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
