import Link from 'next/link';
import s from '@/styles/shared.module.css';
import { getAdminClient, rowsToApp } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const supabase = getAdminClient();
  const { data } = await supabase
    .from('task')
    .select('*, deal(*, borrower(*))')
    .order('due_date', { ascending: true });
  const tasks = rowsToApp((data ?? []) as Record<string, unknown>[]);

  const taskList = Array.isArray(tasks) ? tasks : [];
  const pending = taskList.filter((t: { status: string }) => t.status === 'pending');
  const completed = taskList.filter((t: { status: string }) => t.status === 'completed');
  const overdue = pending.filter((t: { dueDate?: string }) => t.dueDate && new Date(t.dueDate) < new Date());
  const dueSoon = pending.filter((t: { dueDate?: string }) => t.dueDate && new Date(t.dueDate) >= new Date());

  const sortedTasks = [
    ...overdue.sort((a: { dueDate?: string }, b: { dueDate?: string }) => (a.dueDate && b.dueDate ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() : 0)),
    ...dueSoon.sort((a: { dueDate?: string }, b: { dueDate?: string }) => (a.dueDate && b.dueDate ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() : 0)),
    ...pending.filter((t: { dueDate?: string }) => !t.dueDate),
    ...completed,
  ];

  return (
    <div style={{ padding: '40px' }}>
      <div className={s.pageHeader}>
        <div>
          <h1>Tasks & Activities</h1>
          <p>Manage actionable items across your entire deal pipeline</p>
        </div>
      </div>

      <div className={s.kpiRow} style={{ marginBottom: 32 }}>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Pending Tasks</div>
          <div className={s.kpiValue}>{pending.length}</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Overdue</div>
          <div className={s.kpiValue} style={{ color: overdue.length ? 'var(--bb-danger)' : 'inherit' }}>{overdue.length}</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Completed (Total)</div>
          <div className={s.kpiValue}>{completed.length}</div>
        </div>
      </div>

      {overdue.length > 0 && (
        <div className={s.card} style={{ marginBottom: 24, borderLeft: '4px solid var(--bb-danger)' }}>
          <div className={s.cardTitle} style={{ marginBottom: 8 }}>Overdue — act now</div>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--bb-text-secondary)' }}>
            {overdue.slice(0, 8).map((t: { id: string; title: string; dealId?: string; deal?: { propertyAddress?: string; id: string; borrower?: { firstName?: string; lastName?: string } }; dueDate?: string }) => (
              <li key={t.id}>
                <Link href={t.dealId ? `/deals/${t.dealId}` : '#'} style={{ color: 'var(--bb-accent)', fontWeight: 600 }}>{t.title}</Link>
                {t.deal && <span style={{ marginLeft: 8 }}>— {t.deal.propertyAddress || `Deal #${t.deal.id.slice(-6)}`} ({t.deal.borrower?.firstName} {t.deal.borrower?.lastName})</span>}
                {t.dueDate && <span style={{ marginLeft: 8, color: 'var(--bb-danger)' }}>Due {new Date(t.dueDate).toLocaleDateString()}</span>}
              </li>
            ))}
            {overdue.length > 8 && <li style={{ color: 'var(--bb-muted)' }}>+{overdue.length - 8} more below</li>}
          </ul>
        </div>
      )}

      <div className={s.card}>
        <div className={s.cardTitle}>Global Task List</div>
        {taskList.length === 0 ? (
          <div className={s.emptyState}>No tasks found. Tasks created within Deals appear here.</div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Status</th>
                <th>Task</th>
                <th>Related Deal / Borrower</th>
                <th>Due Date</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.map((t: { id: string; title: string; status: string; dueDate?: string; dealId?: string; deal?: { id: string; propertyAddress?: string; borrower?: { firstName?: string; lastName?: string } }; priority?: string }) => {
                const isOverdue = t.status === 'completed' ? false : t.dueDate && new Date(t.dueDate) < new Date();
                return (
                  <tr key={t.id} style={{ opacity: t.status === 'completed' ? 0.6 : 1, backgroundColor: isOverdue ? 'rgba(220, 53, 69, 0.06)' : undefined }}>
                    <td>
                      <span className={`${s.pill} ${t.status === 'completed' ? s.pillGreen : isOverdue ? s.pillRed : s.pillYellow}`}>
                        {t.status === 'completed' ? 'DONE' : isOverdue ? 'OVERDUE' : 'PENDING'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{t.title}</td>
                    <td>
                      {t.deal ? (
                        <Link href={`/deals/${t.deal.id}`} style={{ color: 'var(--bb-accent)', textDecoration: 'none' }}>
                          {t.deal.propertyAddress || `Deal #${t.deal.id.slice(-6)}`}
                          <span style={{ fontSize: 11, color: 'var(--bb-muted)', marginLeft: 8 }}>
                            ({t.deal.borrower?.firstName} {t.deal.borrower?.lastName})
                          </span>
                        </Link>
                      ) : 'General'}
                    </td>
                    <td>
                      {t.dueDate ? (
                        <span style={{ color: isOverdue ? 'var(--bb-danger)' : 'inherit' }}>
                          {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <span className={`${s.pill} ${t.priority === 'urgent' ? s.pillRed : t.priority === 'high' ? s.pillYellow : s.pillGray}`}>
                        {t.priority || 'NORMAL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
