'use client';
import { useState, useEffect } from 'react';
import s from '@/styles/shared.module.css';

interface Condition {
    id: string;
    description: string;
    status: string;
    clearedAt: string | null;
    createdAt: string;
}

export default function ConditionsManager({ dealId }: { dealId: string }) {
    const [conditions, setConditions] = useState<Condition[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [isAdding, setIsAdding] = useState(false);
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetch(`/api/conditions?dealId=${dealId}`)
            .then(r => r.json())
            .then(data => {
                setConditions(data);
                setLoading(false);
            });
    }, [dealId]);

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        const res = await fetch('/api/conditions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dealId, description })
        });
        if (res.ok) {
            const newCond = await res.json();
            setConditions(prev => [newCond, ...prev]);
            setIsAdding(false);
            setDescription('');
        }
    }

    async function updateStatus(id: string, newStatus: string) {
        const res = await fetch(`/api/conditions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            const updated = await res.json();
            setConditions(prev => prev.map(c => c.id === id ? updated : c));
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Remove this condition?')) return;
        const res = await fetch(`/api/conditions/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setConditions(prev => prev.filter(c => c.id !== id));
        }
    }

    if (loading) return <div className={s.card}><div className={s.cardTitle}>Conditions</div><div style={{ color: 'var(--bb-muted)', fontSize: 13 }}>Loading...</div></div>;

    const pending = conditions.filter(c => c.status === 'pending');
    const cleared = conditions.filter(c => c.status !== 'pending');

    return (
        <div className={s.card} style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div className={s.cardTitle} style={{ marginBottom: 0 }}>Conditions / Subject-To</div>
                <button onClick={() => setIsAdding(!isAdding)} className={`${s.btn} ${s.btnPrimary} ${s.btnSmall}`}>
                    {isAdding ? 'Cancel' : '+ Add Condition'}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <input
                        className={s.formInput}
                        style={{ flex: 1 }}
                        placeholder="e.g. Provide 3 months bank statements showing downpayment"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                        autoFocus
                    />
                    <button type="submit" className={`${s.btn} ${s.btnPrimary}`}>Add</button>
                </form>
            )}

            {conditions.length === 0 && !isAdding ? (
                <div className={s.emptyState}>No conditions tracked for this deal.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {pending.map(c => (
                        <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12, border: '1px solid var(--bb-border)', borderRadius: 6, backgroundColor: 'var(--bb-bg-secondary)' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--bb-text)' }}>{c.description}</div>
                                <div style={{ fontSize: 12, color: 'var(--bb-text-secondary)', marginTop: 4 }}>Added {new Date(c.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button type="button" onClick={() => updateStatus(c.id, 'met')} className={`${s.btn} ${s.btnGreen} ${s.btnSmall}`}>Mark Met</button>
                                <button type="button" onClick={() => updateStatus(c.id, 'waived')} className={`${s.btn} ${s.btnYellow} ${s.btnSmall}`}>Waive</button>
                                <button type="button" onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', color: 'var(--bb-muted)', cursor: 'pointer', fontSize: 14 }}>&times;</button>
                            </div>
                        </div>
                    ))}

                    {cleared.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--bb-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Cleared Conditions</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {cleared.map(c => (
                                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', opacity: 0.7 }}>
                                        <span className={`${s.pill} ${c.status === 'met' ? s.pillGreen : s.pillYellow}`}>{c.status}</span>
                                        <div style={{ flex: 1, fontSize: 13, textDecoration: c.status === 'waived' ? 'line-through' : 'none' }}>{c.description}</div>
                                        <div style={{ fontSize: 11, color: 'var(--bb-muted)' }}>{c.clearedAt ? new Date(c.clearedAt).toLocaleDateString() : ''}</div>
                                        <button type="button" onClick={() => updateStatus(c.id, 'pending')} className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`} style={{ padding: '2px 8px', fontSize: 11 }}>Reopen</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
