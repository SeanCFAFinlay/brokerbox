import prisma from '@/lib/prisma';
import s from '@/styles/shared.module.css';
import { PipelineChart } from '@/components/dashboard/PipelineChart';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActionItems } from '@/components/dashboard/ActionItems';
import TaskList from '@/components/TaskList';
import {
  pipelineVolume as domainPipelineVolume,
  fundedVolume as domainFundedVolume,
  closeRate as domainCloseRate,
  avgDaysToFund as domainAvgDaysToFund,
  fundedCount as domainFundedCount,
  getNextBestActions,
} from '@brokerbox/domain';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [borrowerCount, lenderCount, dealCount, deals, docRequests, recentLogs, lenders, tasks] = await Promise.all([
    prisma.borrower.count(),
    prisma.lender.count(),
    prisma.deal.count(),
    prisma.deal.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: { borrower: true, lender: true },
    }),
    prisma.docRequest.findMany({
      where: { status: 'requested' },
      include: { borrower: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.dealActivity.findMany({ orderBy: { timestamp: 'desc' }, take: 8 }),
    prisma.lender.findMany({ where: { status: 'active' }, select: { capitalAvailable: true, capitalCommitted: true } }),
    prisma.task.findMany({ where: { status: 'pending' }, take: 50 }),
  ]);

  const dealSnapshots = deals.map((d) => ({
    id: d.id,
    stage: d.stage,
    updatedAt: d.updatedAt,
    createdAt: d.createdAt,
    fundingDate: d.fundingDate,
    totalRevenue: d.totalRevenue,
    netBrokerageRevenue: d.netBrokerageRevenue,
    brokerFee: d.brokerFee,
    loanAmount: d.loanAmount,
  }));

  const pipelineVol = domainPipelineVolume(dealSnapshots);
  const totalVolume = domainFundedVolume(dealSnapshots);
  const closeRateVal = domainCloseRate(dealSnapshots);
  const avgDaysVal = domainAvgDaysToFund(dealSnapshots);
  const fundedCount = domainFundedCount(dealSnapshots);

  const closeRate = closeRateVal != null ? String(closeRateVal) : '—';
  const avgDaysToFund = avgDaysVal != null ? String(avgDaysVal) : '—';

  const totalCapital = lenders.reduce((sum, l) => sum + l.capitalAvailable, 0);
  const committedCapital = lenders.reduce((sum, l) => sum + l.capitalCommitted, 0);

  const borrowersForNba = Array.from(
    new Map(deals.map((d) => [d.borrower.id, { id: d.borrower.id, updatedAt: d.borrower.updatedAt }])).values()
  );
  const dealsForNba = deals.map((d) => ({
    id: d.id,
    borrowerId: d.borrowerId,
    stage: d.stage,
    updatedAt: d.updatedAt,
  }));
  const tasksForNba = tasks.map((t) => ({
    id: t.id,
    dueDate: t.dueDate,
    status: t.status,
    dealId: t.dealId,
    entityType: t.entityType,
    entityId: t.entityId,
  }));
  const docsForNba = docRequests.map((d) => ({
    id: d.id,
    borrowerId: d.borrowerId,
    dealId: d.dealId,
    status: d.status,
    createdAt: d.createdAt,
  }));

  const nbaActions = getNextBestActions(borrowersForNba, dealsForNba, tasksForNba, docsForNba);

  const stages = ['intake', 'in_review', 'matched', 'committed', 'funded'];
  const chartData = stages.map((st) => {
    const stageDeals = deals.filter((d) => d.stage === st);
    return {
      stage: st.replace('_', ' '),
      count: stageDeals.length,
      volume: stageDeals.reduce((sum, d) => sum + d.loanAmount, 0),
    };
  });

  const actionItems = [
    ...nbaActions.slice(0, 5).map((a) => ({
      id: `${a.entityId}-${a.type}`,
      type: 'system_alert' as const,
      title: a.title,
      subtitle: a.reason,
      date: new Date(),
      href: a.href ?? '#',
    })),
    ...docRequests.slice(0, 5).map((doc: { id: string; docType: string; createdAt: Date; borrowerId: string; borrower: { firstName: string; lastName: string } }) => ({
      id: doc.id,
      type: 'doc_request' as const,
      title: `Missing: ${doc.docType}`,
      subtitle: `For ${doc.borrower.firstName} ${doc.borrower.lastName}`,
      date: doc.createdAt,
      href: `/borrowers/${doc.borrowerId}`,
    })),
  ];

  const stageColor = (stage: string) =>
    stage === 'funded' ? s.pillGreen
      : stage === 'committed' ? s.pillBlue
        : stage === 'matched' ? s.pillYellow
          : stage === 'declined' ? s.pillRed
            : s.pillGray;

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
          <div className={s.kpiValue}>${(pipelineVol / 1e6).toFixed(1)}M</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Funded Volume</div>
          <div className={s.kpiValue}>${(totalVolume / 1e6).toFixed(1)}M</div>
          <div className={s.kpiSub}>{fundedCount} deals closed</div>
        </div>
      </div>

      {/* New metrics row */}
      <div className={s.kpiRow} style={{ marginTop: 16 }}>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Close Rate</div>
          <div className={s.kpiValue} style={{ color: 'var(--bb-success)' }}>{closeRate}{closeRate !== '—' ? '%' : ''}</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Avg Days to Fund</div>
          <div className={s.kpiValue}>{avgDaysToFund}{avgDaysToFund !== '—' ? ' days' : ''}</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Capital Available</div>
          <div className={s.kpiValue}>${(totalCapital / 1e6).toFixed(1)}M</div>
          <div className={s.kpiSub}>${(committedCapital / 1e6).toFixed(1)}M committed</div>
        </div>
      </div>

      <div className={s.grid2} style={{ marginTop: 24 }}>
        {/* Pipeline Chart */}
        <div className={s.card}>
          <div className={s.cardTitle}>Pipeline by Stage</div>
          <PipelineChart data={chartData} />
        </div>

        {/* Action Items & Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className={s.card}>
            <div className={s.cardTitle}>Action Items</div>
            <ActionItems items={actionItems} />
          </div>
          <div className={s.card}>
            <TaskList />
          </div>
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
              {deals.slice(0, 5).map(d => (
                <tr key={d.id}>
                  <td>{d.borrower.firstName} {d.borrower.lastName}</td>
                  <td>${d.loanAmount.toLocaleString()}</td>
                  <td><span className={`${s.pill} ${stageColor(d.stage)}`}>{d.stage.replace('_', ' ')}</span></td>
                </tr>
              ))}
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
                  <span><strong>{log.action}</strong> {log.entity} #{log.entityId.slice(-6)} <small>by {log.actorName || 'System'}</small></span>
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
