'use client';
import { useState, useEffect } from 'react';
import s from '@/styles/shared.module.css';

interface Task {
    id: string;
    title: string;
    description: string | null;
    dueDate: string | null;
    status: string;
    createdAt: string;
}

export default function TaskList({ entityType, entityId }: { entityType?: string; entityId?: string }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        let url = '/api/tasks';
        if (entityType && entityId) {
            url += `?entityType=${entityType}&entityId=${entityId}`;
        }
        fetch(url).then(r => r.json()).then(data => {
            if (Array.isArray(data)) {
                setTasks(data);
            } else {
                console.error('Expected array from /api/tasks, got:', data);
                setTasks([]);
            }
            setLoading(false);
        }).catch(err => {
            console.error('Failed to fetch tasks:', err);
            setLoading(false);
        });
    }, [entityType, entityId]);

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        const res = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                description: description || null,
                dueDate: dueDate || null,
                entityType,
                entityId
            })
        });
        if (res.ok) {
            const newTask = await res.json();
            setTasks(prev => [newTask, ...prev].sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }));
            setIsAdding(false);
            setTitle('');
            setDescription('');
            setDueDate('');
        }
    }

    async function toggleComplete(task: Task) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        const res = await fetch(`/api/tasks/${task.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
        }
    }

    if (loading) return <div style={{ padding: 16, color: 'var(--bb-muted)' }}>Loading tasks...</div>;

    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Tasks & Reminders</h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`${s.btn} ${s.btnPrimary}`}
                    style={{ padding: '6px 12px', fontSize: '0.9rem' }}
                >
                    {isAdding ? 'Cancel' : '+ New Task'}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className={s.card} style={{ border: '1px solid var(--bb-border)', padding: '16px', background: 'var(--bb-bg-secondary)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <label className={s.formLabel}>Task Title</label>
                            <input className={s.formInput} value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Follow up with lender" />
                        </div>
                        <div>
                            <label className={s.formLabel}>Due Date</label>
                            <input type="date" className={s.formInput} value={dueDate} onChange={e => setDueDate(e.target.value)} />
                        </div>
                        <div>
                            <label className={s.formLabel}>Notes (optional)</label>
                            <input className={s.formInput} value={description} onChange={e => setDescription(e.target.value)} />
                        </div>
                        <div style={{ alignSelf: 'flex-end', marginTop: 8 }}>
                            <button type="submit" className={`${s.btn} ${s.btnPrimary}`}>Save Task</button>
                        </div>
                    </div>
                </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingTasks.length === 0 && completedTasks.length === 0 && !isAdding && (
                    <div style={{ color: 'var(--bb-muted)', fontSize: '0.9rem', padding: '12px 0' }}>No tasks found.</div>
                )}

                {pendingTasks.map(task => (
                    <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'var(--bb-bg)', borderRadius: '8px', border: '1px solid var(--bb-border)' }}>
                        <input
                            type="checkbox"
                            checked={false}
                            onChange={() => toggleComplete(task)}
                            style={{ marginTop: '4px', cursor: 'pointer', width: '18px', height: '18px' }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{task.title}</div>
                            {task.description && <div style={{ fontSize: '0.85rem', color: 'var(--bb-muted)', marginTop: 4 }}>{task.description}</div>}
                            {task.dueDate && (
                                <div style={{ fontSize: '0.8rem', color: new Date(task.dueDate) < new Date() ? 'var(--bb-danger)' : 'var(--bb-brand)', marginTop: 6, fontWeight: 500 }}>
                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {completedTasks.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--bb-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Completed</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {completedTasks.map(task => (
                                <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '8px 12px', opacity: 0.6 }}>
                                    <input
                                        type="checkbox"
                                        checked={true}
                                        onChange={() => toggleComplete(task)}
                                        style={{ marginTop: '4px', cursor: 'pointer' }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ textDecoration: 'line-through', fontSize: '0.9rem' }}>{task.title}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
