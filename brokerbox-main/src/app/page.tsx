import { getAdminClient, rowsToApp } from '@/lib/db';
import s from '@/styles/shared.module.css';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { PipelineCommandCenter } from '@/components/dashboard/PipelineCommandCenter';
import { ActionItems } from '@/components/dashboard/ActionItems';
import TaskList from '@/components/TaskList';
import { getNextBestActions } from '@/lib/domain';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = getAdminClient();
  const [dealsRes, borrowersRes, tasksRes, docRequestsRes, logsRes] = await Promise.all([
    supabase.from('deal').select('id, stage, loan_amount, borrower_id, updated_at, created_at, funding_date').order('updated_at', { ascending: false }).limit(200),
    supabase.from('borrower').select('id, updated_at').eq('status', 'active'),
    supabase.from('task').select('*').eq('status', 'pending').limit(50),
    supabase.from('doc_request').select('*, borrower(*)').eq('status', 'requested').order('created_at', { ascending: false }).limit(10),
    supabase.from('deal_activity').select('*').order('timestamp', { ascending: false }).limit(8),
  ]);

  const deals = rowsToApp((dealsRes.data ?? []) as Record<string, unknown>[]);
  const borrowers = rowsToApp((borrowersRes.data ?? []) as Record<string, unknown>[]);
  const tasks = rowsToApp((tasksRes.data ?? []) as Record<string, unknown>[]);
  const docRequests = rowsToApp((docRequestsRes.data ?? []) as Record<string, unknown>[]);
  const recentLogs = rowsToApp((logsRes.data ?? []) as Record<string, unknown>[]);

  const toDate = (v: unknown) => (v instanceof Date ? v : v != null ? new Date(v as string) : null);
  const nbaBorrowers = (borrowers as Record<string, unknown>[]).map((b) => ({
    id: b.id as string,
    updatedAt: toDate(b.updatedAt ?? b.updated_at) ?? new Date(),
  }));
  const nbaDeals = (deals as Record<string, unknown>[]).map((d) => ({
    id: d.id as string,
    borrowerId: (d.borrowerId ?? d.borrower_id) as string,
    stage: (d.stage ?? 'intake') as string,
    updatedAt: toDate(d.updatedAt ?? d.updated_at) ?? new Date(),
  }));
  const nbaTasks = (tasks as Record<string, unknown>[]).map((t) => ({
    id: t.id as string,
    dueDate: toDate(t.dueDate ?? t.due_date),
    status: (t.status ?? 'pending') as string,
    dealId: (t.dealId ?? t.deal_id) as string | null,
    entityType: (t.entityType ?? t.entity_type) as string | null,
    entityId: (t.entityId ?? t.entity_id) as string | null,
  }));
  const docSnapshots = (docRequests as Record<string, unknown>[]).map((d) => ({
    id: d.id as string,
    borrowerId: (d.borrowerId ?? d.borrower_id) as string,
    dealId: (d.dealId ?? d.deal_id) as string | null,
    status: (d.status ?? 'requested') as string,
    createdAt: toDate(d.createdAt ?? d.created_at) ?? new Date(),
  }));

  const nbaActions = getNextBestActions(nbaBorrowers, nbaDeals, nbaTasks, docSnapshots);

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
        <PipelineCommandCenter deals={deals as { id: string; stage: string; loanAmount: number }[]} />
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
              {(recentLogs as { id: string; action: string; entity: string; timestamp: string }[]).map((log) => (
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
