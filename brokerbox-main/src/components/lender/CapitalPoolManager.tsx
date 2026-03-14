'use client';
import { useState } from 'react';
import s from '@/styles/shared.module.css';

interface Pool {
    id: string;
    name: string;
    totalAmount: number;
    availableAmount: number;
    effectiveLTV: number;
    utilizationRate: number;
    targetYield: number;
    status: string;
    lenderId: string;
    investments?: Investment[];
}

interface Investment {
    id: string;
    amount: number;
    yield: number;
    userId: string;
    user: { name: string };
    status: string;
}

export function CapitalPoolManager({ initialPools, lenderId }: { initialPools: Pool[], lenderId: string }) {
    const [pools, setPools] = useState(initialPools);
    const [isCreating, setIsCreating] = useState(false);
    const [addingInvestmentTo, setAddingInvestmentTo] = useState<string | null>(null);
    const [investors, setInvestors] = useState<{ id: string, name: string }[]>([]);
    const [formData, setFormData] = useState({ name: '', totalAmount: 1000000, effectiveLTV: 75, targetYield: 10 });
    const [invData, setInvData] = useState({ userId: '', amount: 50000, yield: 10 });

    async function handleCreate() {
        const res = await fetch('/api/capital/pools', {
            method: 'POST',
            body: JSON.stringify({ ...formData, lenderId })
        });
        if (res.ok) {
            const newPool = await res.json();
            setPools([newPool, ...pools]);
            setIsCreating(false);
        }
    }

    async function loadInvestors() {
        const res = await fetch('/api/users/investors');
        if (res.ok) setInvestors(await res.json());
    }

    async function handleAddInvestment(poolId: string) {
        const res = await fetch('/api/capital/investments', {
            method: 'POST',
            body: JSON.stringify({ ...invData, poolId })
        });
        if (res.ok) {
            const newInv = await res.json();
            setPools(pools.map(p => p.id === poolId ? {
                ...p,
                investments: [...(p.investments || []), newInv],
                availableAmount: p.availableAmount + newInv.amount,
                totalAmount: p.totalAmount + newInv.amount,
                utilizationRate: ((p.totalAmount + newInv.amount - (p.availableAmount + newInv.amount)) / (p.totalAmount + newInv.amount || 1)) * 100
            } : p));
            setAddingInvestmentTo(null);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this pool?')) return;
        const res = await fetch(`/api/capital/pools/${id}`, { method: 'DELETE' });
        if (res.ok) setPools(pools.filter(p => p.id !== id));
    }

    const totalManaged = pools.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalAvailable = pools.reduce((sum, p) => sum + p.availableAmount, 0);
    const avgLTV = pools.length > 0 ? pools.reduce((sum, p) => sum + p.effectiveLTV, 0) / pools.length : 0;
    const deploymentStatus = ((totalManaged - totalAvailable) / (totalManaged || 1) * 100);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div className={s.kpiRow}>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Total Assets Under Management</div>
                    <div className={s.kpiValue}>${totalManaged.toLocaleString()}</div>
                </div>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Dry Powder / Available</div>
                    <div className={s.kpiValue} style={{ color: 'var(--bb-success)' }}>${totalAvailable.toLocaleString()}</div>
                </div>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Target Max LTV (Avg)</div>
                    <div className={s.kpiValue}>{avgLTV.toFixed(1)}%</div>
                </div>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Deployment Status</div>
                    <div className={s.kpiValue} style={{ fontSize: 18 }}>
                        {deploymentStatus.toFixed(1)}% Deploy.
                    </div>
                </div>
            </div>

            <div className={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div className={s.cardTitle}>Managed Capital Pools</div>
                    <button className={`${s.btn} ${s.btnPrimary} ${s.btnSmall}`} onClick={() => setIsCreating(true)}>+ New Pool</button>
                </div>

                {isCreating && (
                    <div style={{ marginBottom: 24, padding: 16, background: 'var(--bb-surface-2)', borderRadius: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Pool Name</label>
                                <input className={s.formInput} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Ontario Residential Fund" />
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Total Capacity ($)</label>
                                <input type="number" className={s.formInput} value={formData.totalAmount} onChange={e => setFormData({ ...formData, totalAmount: Number(e.target.value) })} />
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Target LTV (%)</label>
                                <input type="number" className={s.formInput} value={formData.effectiveLTV} onChange={e => setFormData({ ...formData, effectiveLTV: Number(e.target.value) })} />
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Target Yield (%)</label>
                                <input type="number" className={s.formInput} value={formData.targetYield} onChange={e => setFormData({ ...formData, targetYield: Number(e.target.value) })} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                            <button className={`${s.btn} ${s.btnPrimary}`} onClick={handleCreate}>Create Pool</button>
                            <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => setIsCreating(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {pools.map(pool => (
                        <div key={pool.id} style={{ padding: 16, border: '1px solid var(--bb-border)', borderRadius: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: 0 }}>{pool.name}</h4>
                                    <div style={{ fontSize: 12, color: 'var(--bb-muted)', marginTop: 4 }}>
                                        Target: {pool.effectiveLTV}% LTV · Yield: {pool.targetYield}%
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700 }}>${pool.totalAmount.toLocaleString()}</div>
                                        <div style={{ fontSize: 11, color: 'var(--bb-muted)' }}>{pool.utilizationRate.toFixed(1)}% Utilized</div>
                                    </div>
                                    <button className={`${s.btn} ${s.btnSmall} ${s.btnSecondary}`} style={{ color: 'var(--bb-danger)' }} onClick={() => handleDelete(pool.id)}>✕</button>
                                </div>
                            </div>
                            <div style={{ height: 4, background: 'var(--bb-bg-secondary)', borderRadius: 2, marginTop: 12, overflow: 'hidden' }}>
                                <div style={{ width: `${pool.utilizationRate}%`, height: '100%', background: 'var(--bb-accent)' }}></div>
                            </div>

                            {/* Investments Section */}
                            <div style={{ marginTop: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>Investor Allocations</div>
                                    <button className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`} onClick={() => { setAddingInvestmentTo(pool.id); loadInvestors(); }}>+ Add Investor</button>
                                </div>

                                {addingInvestmentTo === pool.id && (
                                    <div style={{ padding: 12, background: 'var(--bb-surface-2)', borderRadius: 8, marginBottom: 8 }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: 8 }}>
                                            <select className={s.formInput} value={invData.userId} onChange={e => setInvData({ ...invData, userId: e.target.value })}>
                                                <option value="">Select Investor...</option>
                                                {investors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                            </select>
                                            <input type="number" className={s.formInput} value={invData.amount} onChange={e => setInvData({ ...invData, amount: Number(e.target.value) })} placeholder="Amount" />
                                            <button className={s.btn} onClick={() => handleAddInvestment(pool.id)}>Add</button>
                                        </div>
                                    </div>
                                )}

                                <table className={s.table} style={{ fontSize: 12 }}>
                                    <tbody>
                                        {(pool.investments || []).map(inv => (
                                            <tr key={inv.id}>
                                                <td style={{ padding: '8px 4px' }}>{inv.user?.name || 'Unknown'}</td>
                                                <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 600 }}>${inv.amount.toLocaleString()}</td>
                                                <td style={{ padding: '8px 4px', textAlign: 'right' }}>{inv.yield}%</td>
                                            </tr>
                                        ))}
                                        {(!pool.investments || pool.investments.length === 0) && (
                                            <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--bb-muted)', padding: 8 }}>No investors.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                    {pools.length === 0 && <div className={s.emptyState}>No active pools.</div>}
                </div>
            </div>
        </div>
    );
}
