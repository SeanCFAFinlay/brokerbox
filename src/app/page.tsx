import { db } from '@/lib/db';
import s from '@/styles/shared.module.css';
import { PipelineChart } from '@/components/dashboard/PipelineChart';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActionItems } from '@/components/dashboard/ActionItems';
import TaskList from '@/components/TaskList';
import {
  pipelineVolume,
  fundedVolume,
  closeRate as calculateCloseRate,
  avgDaysToFund as calculateAvgDays,
  fundedCount as calculateFundedCount,
  getNextBestActions,
} from '@/lib/domain';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [borrowers, lenders, deals, docRequests, recentLogs, tasks] = await Promise.all([
    db.borrower.findMany({ where: { status: 'active' } }),
    db.lender.findMany({ where: { status: 'active' } }),
    db.deal.findMany({
      include: { borrower: true, lender: true },
      orderBy: { updatedAt: 'desc' },
      take: 100
    }),
    db.docRequest.findMany({
      where: { status: 'requested' },
      include: { borrower: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    db.dealActivity.findMany({ orderBy: { timestamp: 'desc' }, take: 10 }),
    db.task.findMany({ where: { status: 'pending' }, take: 50 }),
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

  const pipeVol = pipelineVolume(dealSnapshots);
  const fundVol = fundedVolume(dealSnapshots);
  const cr = calculateCloseRate(dealSnapshots);
  const daysVal = calculateAvgDays(dealSnapshots);
  const fCount = calculateFundedCount(dealSnapshots);

  const totalCapital = lenders.reduce((sum, l) => sum + (l.capitalAvailable || 0), 0);
  const committedCapital = lenders.reduce((sum, l) => sum + (l.capitalCommitted || 0), 0);
  const utilization = totalCapital > 0 ? (committedCapital / totalCapital) * 100 : 0;

  const nbaActions = getNextBestActions(
    borrowers.map(b => ({ id: b.id, updatedAt: b.updatedAt })),
    deals.map(d => ({ id: d.id, borrowerId: d.borrowerId, stage: d.stage, updatedAt: d.updatedAt })),
    tasks.map(t => ({ id: t.id, dueDate: t.dueDate, status: t.status, dealId: t.dealId, entityType: t.entityType, entityId: t.entityId })),
    docRequests.map(d => ({ id: d.id, borrowerId: d.borrowerId, dealId: d.dealId, status: d.status, createdAt: d.createdAt }))
  );

  const actionItems = [
    ...nbaActions.slice(0, 4).map((a) => ({
      id: `${a.entityId}-${a.type}`,
      type: 'system_alert' as const,
      title: a.title,
      subtitle: a.reason,
      date: new Date(),
      href: a.href ?? '#',
    })),
    ...docRequests.slice(0, 3).map(doc => ({
      id: doc.id,
      type: 'doc_request' as const,
      title: `Missing: ${doc.docType}`,
      subtitle: `For ${doc.borrower.firstName} ${doc.borrower.lastName}`,
      date: doc.createdAt,
      href: `/borrowers/${doc.borrowerId}`,
    })),
  ];

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <h1>Broker Command Center</h1>
        <p>Private Mortgage Dashboard — Real-time Capital & Performance</p>
      </div>

      <QuickActions />

      <div className={s.kpiRow}>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Total Assets Under Mgmt</div>
          <div className={s.kpiValue}>${(totalCapital / 1e6).toFixed(1)}M</div>
          <div className={s.kpiSub}>{utilization.toFixed(1)}% Utilization</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Pipeline Volume</div>
          <div className={s.kpiValue}>${(pipeVol / 1e6).toFixed(1)}M</div>
          <div className={s.kpiSub}>{deals.length} active files</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Funded YTD</div>
          <div className={s.kpiValue}>${(fundVol / 1e6).toFixed(1)}M</div>
          <div className={s.kpiSub}>{fCount} deals closed</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Portfolio Avg LTV</div>
          <div className={s.kpiValue} style={{ color: 'var(--bb-success)' }}>68.2%</div>
          <div className={s.kpiSub}>-1.4% from last month</div>
        </div>
      </div>

      <div className={s.grid2} style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className={s.card}>
            <div className={s.cardTitle}>Funding Pipeline</div>
            <PipelineChart data={['intake', 'in_review', 'matched', 'committed', 'funded'].map(st => ({
              stage: st.replace('_', ' '),
              count: deals.filter(d => d.stage === st).length,
              volume: deals.filter(d => d.stage === st).reduce((sum, d) => sum + d.loanAmount, 0)
            }))} />
          </div>
          <div className={s.card}>
            <div className={s.cardTitle}>Recent Deal Flow</div>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Borrower</th>
                  <th>Amount</th>
                  <th>Stage</th>
                </tr>
              </thead>
              <tbody>
                {deals.slice(0, 6).map(d => (
                  <tr key={d.id}>
                    <td>{d.borrower.firstName} {d.borrower.lastName}</td>
                    <td>${(d.loanAmount / 1000).toFixed(0)}k</td>
                    <td><span className={s.pill}>{d.stage.replace('_', ' ')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className={s.card}>
            <div className={s.cardTitle}>Priority Worklist</div>
            <ActionItems items={actionItems} />
          </div>
          <div className={s.card}>
            <div className={s.cardTitle}>Recent Audit Log</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentLogs.map((log: any) => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--bb-text-secondary)' }}>
                  <span><strong>{log.action}</strong> {log.entity}</span>
                  <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={s.card}>
            <TaskList />
          </div>
        </div>
      </div>
    </div>
  );
}
