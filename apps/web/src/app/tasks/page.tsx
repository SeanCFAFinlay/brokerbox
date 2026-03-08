import prisma from '@/lib/prisma';
import Link from 'next/link';
import s from '@/styles/shared.module.css';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
    const tasks = await prisma.task.findMany({
        orderBy: { dueDate: 'asc' },
        include: { Deal: { include: { borrower: true } } }
    });

    const pending = tasks.filter(t => t.status === 'pending');
    const completed = tasks.filter(t => t.status === 'completed');

    const overdue = pending.filter(t => t.dueDate && new Date(t.dueDate) < new Date());

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
                    <div className={s.kpiValue} style={{ color: 'var(--bb-danger)' }}>{overdue.length}</div>
                </div>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Completed (Total)</div>
                    <div className={s.kpiValue}>{completed.length}</div>
                </div>
            </div>

            <div className={s.card}>
                <div className={s.cardTitle}>Global Task List</div>
                {tasks.length === 0 ? (
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
                            {tasks.map(t => (
                                <tr key={t.id} style={{ opacity: t.status === 'completed' ? 0.6 : 1 }}>
                                    <td>
                                        <span className={`${s.pill} ${t.status === 'completed' ? s.pillGreen : s.pillYellow}`}>
                                            {t.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{t.title}</td>
                                    <td>
                                        {t.Deal ? (
                                            <Link href={`/deals/${t.Deal.id}`} style={{ color: 'var(--bb-accent)', textDecoration: 'none' }}>
                                                {t.Deal.propertyAddress || `Deal #${t.Deal.id.slice(-6)}`}
                                                <span style={{ fontSize: 11, color: 'var(--bb-muted)', marginLeft: 8 }}>
                                                    ({t.Deal.borrower.firstName} {t.Deal.borrower.lastName})
                                                </span>
                                            </Link>
                                        ) : 'General'}
                                    </td>
                                    <td>
                                        {t.dueDate ? (
                                            <span style={{ color: (t.status === 'pending' && new Date(t.dueDate) < new Date()) ? 'var(--bb-danger)' : 'inherit' }}>
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
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
