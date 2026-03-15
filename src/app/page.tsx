import { supabase } from '@/lib/supabase';
import s from '@/styles/shared.module.css';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { PipelineCommandCenter } from '@/components/dashboard/PipelineCommandCenter';
import { ActionItems } from '@/components/dashboard/ActionItems';
import TaskList from '@/components/TaskList';
import { getNextBestActions } from '@/lib/domain';

export const dynamic = 'force-dynamic';

export default async function Page() {
  // Fetch real data using pure Supabase client
  const [
    { data: dealsData },
    { data: borrowersData },
    { data: tasksData },
    { data: docRequestsData },
    { data: recentLogsData }
  ] = await Promise.all([
    supabase.from('Deal').select('id, stage, loanAmount, borrowerId, updatedAt, createdAt, fundingDate').order('updatedAt', { ascending: false }).limit(200),
    supabase.from('Borrower').select('id, updatedAt').eq('status', 'active'),
    supabase.from('Task').select('*').eq('status', 'pending').limit(50),
    supabase.from('DocRequest').select('*, borrower:Borrower(*)').eq('status', 'requested').order('createdAt', { ascending: false }).limit(10),
    supabase.from('DealActivity').select('*').order('timestamp', { ascending: false }).limit(8),
  ]);

  const deals = Array.isArray(dealsData) ? dealsData : [];
  const borrowers = Array.isArray(borrowersData) ? borrowersData : [];
  const tasks = Array.isArray(tasksData) ? tasksData : [];
  const docRequests = Array.isArray(docRequestsData) ? docRequestsData : [];
  const recentLogs = Array.isArray(recentLogsData) ? recentLogsData : [];

  // Map data for NBA
  const nbaActions = getNextBestActions(
    borrowers,
    deals,
    tasks,
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

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <h1>Broker Command Center</h1>
        <p>Real-time Pipeline Intelligence & Asset Management</p>
      </div>

      <QuickActions />

      <div style={{ marginTop: 24 }}>
        <PipelineCommandCenter deals={deals} />
      </div>

      <div className={s.grid2} style={{ marginTop: 24 }}>
        <div className={s.card}>
          <div className={s.cardTitle}>Action Items</div>
          <ActionItems items={actionItems} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className={s.card}>
            <div className={s.cardTitle}>Recent Activity</div>
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
