'use client';

import { useState } from 'react';
import s from '@/styles/shared.module.css';

export default function CapitalPoolClient({ initialPools, lenders, investors }: any) {
    const [pools, setPools] = useState(initialPools);
    const [createOpen, setCreateOpen] = useState(false);
    const [investOpen, setInvestOpen] = useState<{ id: string, name: string } | null>(null);

    async function handleCreatePool(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const data = Object.fromEntries(fd.entries());

        const res = await fetch('/api/capital/pools', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            setCreateOpen(false);
            window.location.reload(); // Quick refresh to get populated nested relations
        }
    }

    async function handleAddInvestment(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!investOpen) return;

        const fd = new FormData(e.currentTarget);
        const data = Object.fromEntries(fd.entries());

        const res = await fetch('/api/capital/investments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, poolId: investOpen.id })
        });

        if (res.ok) {
            setInvestOpen(null);
            window.location.reload();
        }
    }

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2>Active Capital Pools</h2>
                <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => setCreateOpen(true)}>+ New Pool</button>
            </div>

            <div className={s.grid2}>
                {pools.map((p: any) => {
                    const progress = p.totalAmount > 0 ? ((p.totalAmount - p.availableAmount) / p.totalAmount) * 100 : 0;
                    return (
                        <div key={p.id} className={s.card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div className={s.cardTitle} style={{ marginBottom: 4 }}>{p.name}</div>
                                    <div style={{ fontSize: 13, color: 'var(--bb-muted)', marginBottom: 16 }}>Managed by {p.lender.name}</div>
                                </div>
                                <span className={`${s.pill} ${p.status === 'active' ? s.pillGreen : s.pillYellow}`}>{p.status.toUpperCase()}</span>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                                    <span>${(p.totalAmount - p.availableAmount).toLocaleString()} Deployed</span>
                                    <span>${p.totalAmount.toLocaleString()} Total</span>
                                </div>
                                <div style={{ height: 8, background: 'var(--bb-bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', background: 'var(--bb-accent)', width: `${progress}%` }} />
                                </div>
                            </div>

                            <div className={s.kpiRow} style={{ marginBottom: 16 }}>
                                <div className={s.kpiCard} style={{ padding: 12 }}>
                                    <div className={s.kpiLabel}>Target Yield</div>
                                    <div className={s.kpiValue} style={{ fontSize: 18 }}>{p.targetYield.toFixed(1)}%</div>
                                </div>
                                <div className={s.kpiCard} style={{ padding: 12 }}>
                                    <div className={s.kpiLabel}>Min. Investment</div>
                                    <div className={s.kpiValue} style={{ fontSize: 18 }}>${p.minInvestment.toLocaleString()}</div>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--bb-border)', paddingTop: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>Investors ({p.investments.length})</div>
                                    <button className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`} onClick={() => setInvestOpen({ id: p.id, name: p.name })}>+ Allocate</button>
                                </div>
                                {p.investments.length === 0 ? (
                                    <div className={s.emptyState} style={{ padding: 12, fontSize: 12 }}>No investor capital allocated yet.</div>
                                ) : (
                                    <table className={s.table} style={{ fontSize: 13 }}>
                                        <tbody>
                                            {p.investments.map((inv: any) => (
                                                <tr key={inv.id}>
                                                    <td>{inv.user.name}</td>
                                                    <td style={{ textAlign: 'right' }}>${inv.amount.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Modals */}
            {createOpen && (
                <div className={s.modal}>
                    <div className={s.modalBackdrop} onClick={() => setCreateOpen(false)} />
                    <div className={s.modalContent}>
                        <div className={s.modalHeader}>
                            <div className={s.modalTitle}>Create Capital Pool</div>
                            <button className={s.modalClose} onClick={() => setCreateOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleCreatePool}>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Pool Name</label>
                                <input name="name" required className={s.formInput} placeholder="e.g. Q3 Growth Fund" />
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Lender/MIC Manager</label>
                                <select name="lenderId" required className={s.formInput}>
                                    <option value="">Select Manager...</option>
                                    {lenders.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                            <div className={s.grid2}>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Total Capacity ($)</label>
                                    <input type="number" name="totalAmount" required className={s.formInput} min="10000" />
                                </div>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Target Yield (%)</label>
                                    <input type="number" name="targetYield" step="0.1" required className={s.formInput} defaultValue="8.0" />
                                </div>
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Minimum Investment ($)</label>
                                <input type="number" name="minInvestment" required className={s.formInput} defaultValue="50000" />
                            </div>
                            <div className={s.modalActions}>
                                <button type="button" className={`${s.btn} ${s.btnSecondary}`} onClick={() => setCreateOpen(false)}>Cancel</button>
                                <button type="submit" className={`${s.btn} ${s.btnPrimary}`}>Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {investOpen && (
                <div className={s.modal}>
                    <div className={s.modalBackdrop} onClick={() => setInvestOpen(null)} />
                    <div className={s.modalContent}>
                        <div className={s.modalHeader}>
                            <div className={s.modalTitle}>Allocate Capital to {investOpen.name}</div>
                            <button className={s.modalClose} onClick={() => setInvestOpen(null)}>✕</button>
                        </div>
                        <form onSubmit={handleAddInvestment}>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Investor</label>
                                <select name="userId" required className={s.formInput}>
                                    <option value="">Select Investor...</option>
                                    {investors.map((i: any) => <option key={i.id} value={i.id}>{i.name} ({i.email})</option>)}
                                </select>
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Allocation Amount ($)</label>
                                <input type="number" name="amount" required className={s.formInput} min="1000" />
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Agreed Yield (%)</label>
                                <input type="number" name="yield" step="0.1" className={s.formInput} placeholder="Leave blank for pool default" />
                            </div>
                            <div className={s.modalActions}>
                                <button type="button" className={`${s.btn} ${s.btnSecondary}`} onClick={() => setInvestOpen(null)}>Cancel</button>
                                <button type="submit" className={`${s.btn} ${s.btnPrimary}`}>Allocate</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
