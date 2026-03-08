'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import s from '@/styles/shared.module.css';

interface DealEditFormProps {
    deal: {
        id: string;
        stage: string;
        priority: string;
        propertyAddress: string | null;
        propertyType: string;
        propertyValue: number;
        loanAmount: number;
        interestRate: number | null;
        termMonths: number;
        amortMonths: number;
        position: string;
        loanPurpose: string;
        occupancyType: string;
        exitStrategy: string | null;
        brokerFee: number | null;
        lenderFee: number | null;
        agentCommissionSplit: number;
        totalRevenue: number | null;
        netBrokerageRevenue: number | null;
        notes: string | null;
    };
    lenders: { id: string; name: string }[];
    currentLenderId: string | null;
}

const STAGES = ['intake', 'in_review', 'matched', 'committed', 'funded', 'declined', 'archived'];
const PRIORITIES = ['low', 'normal', 'high', 'urgent'];
const POSITIONS = ['1st', '2nd', '3rd', 'bridge'];
const PURPOSES = ['purchase', 'refinance', 'renewal', 'equity_takeout', 'bridge', 'construction'];
const OCCUPANCY_TYPES = ['owner_occupied', 'rental', 'investment', 'commercial'];
const PROPERTY_TYPES = ['residential', 'condo', 'commercial', 'multi-unit', 'land', 'construction'];

export default function DealEditForm({ deal, lenders, currentLenderId }: DealEditFormProps) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [form, setForm] = useState({ ...deal, lenderId: currentLenderId });

    function update(field: string, value: string | number | null) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    async function handleSave() {
        setSaving(true);
        const body: Record<string, unknown> = {
            stage: form.stage,
            priority: form.priority,
            propertyAddress: form.propertyAddress || null,
            propertyType: form.propertyType,
            propertyValue: Number(form.propertyValue) || 0,
            loanAmount: Number(form.loanAmount) || 0,
            interestRate: form.interestRate ? Number(form.interestRate) : null,
            termMonths: Number(form.termMonths) || 12,
            amortMonths: Number(form.amortMonths) || 300,
            position: form.position,
            loanPurpose: form.loanPurpose,
            occupancyType: form.occupancyType,
            exitStrategy: form.exitStrategy || null,
            brokerFee: form.brokerFee ? Number(form.brokerFee) : null,
            lenderFee: form.lenderFee ? Number(form.lenderFee) : null,
            agentCommissionSplit: Number(form.agentCommissionSplit) || 0,
            notes: form.notes || null,
            lenderId: form.lenderId || null,
        };

        const calcTotalRev = (Number(form.loanAmount) || 0) * (((Number(form.brokerFee) || 0) + (Number(form.lenderFee) || 0)) / 100);
        body.totalRevenue = calcTotalRev;
        body.netBrokerageRevenue = calcTotalRev * (1 - (Number(form.agentCommissionSplit) || 0) / 100);

        const res = await fetch(`/api/deals/${deal.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        setSaving(false);
        if (res.ok) {
            setToast('Deal updated!');
            setTimeout(() => setToast(''), 3000);
            setEditing(false);
            router.refresh();
        } else {
            setToast('Error saving');
            setTimeout(() => setToast(''), 3000);
        }
    }

    const ltv = Number(form.propertyValue) > 0 ? ((Number(form.loanAmount) / Number(form.propertyValue)) * 100).toFixed(1) : '—';

    if (!editing) {
        return (
            <div className={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div className={s.cardTitle} style={{ marginBottom: 0 }}>Deal Parameters</div>
                    <button className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`} onClick={() => setEditing(true)}>Edit</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--bb-muted)' }}>Property Type:</span> <span>{deal.propertyType}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--bb-muted)' }}>Position:</span> <span>{deal.position}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--bb-muted)' }}>Purpose:</span> <span>{deal.loanPurpose}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--bb-muted)' }}>Occupancy:</span> <span>{deal.occupancyType}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--bb-muted)' }}>Term:</span> <span>{deal.termMonths} mos</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--bb-muted)' }}>Amortization:</span> <span>{deal.amortMonths} mos</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--bb-muted)' }}>Interest Rate:</span> <span>{deal.interestRate ? `${deal.interestRate}%` : '—'}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--bb-muted)' }}>Priority:</span> <span className={`${s.pill} ${deal.priority === 'urgent' ? s.pillRed : deal.priority === 'high' ? s.pillYellow : s.pillGray}`}>{deal.priority}</span></div>
                    {deal.brokerFee != null && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--bb-muted)' }}>Broker Fee:</span> <span>{deal.brokerFee}%</span></div>}
                    {deal.lenderFee != null && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--bb-muted)' }}>Lender Fee:</span> <span>{deal.lenderFee}%</span></div>}
                    {deal.exitStrategy && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--bb-muted)' }}>Exit Strategy:</span> <span>{deal.exitStrategy}</span></div>}
                    {deal.notes && (
                        <div style={{ marginTop: 8, padding: 12, backgroundColor: 'var(--bb-bg)', borderRadius: 6, fontSize: 13 }}>
                            <strong>Notes:</strong> {deal.notes}
                        </div>
                    )}
                </div>

                <div className={s.cardTitle} style={{ marginTop: 24, marginBottom: 12, fontSize: 15, borderTop: '1px solid var(--bb-border)', paddingTop: 16 }}>Commission & Revenue</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--bb-muted)' }}>Agent Split:</span> <span style={{ fontWeight: 600 }}>{deal.agentCommissionSplit}%</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--bb-muted)' }}>Total Gross Revenue:</span> <span style={{ fontWeight: 600, color: 'var(--bb-brand)' }}>${(deal.totalRevenue || 0).toLocaleString()}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--bb-muted)' }}>Brokerage Net Retained:</span> <span style={{ fontWeight: 600, color: 'var(--bb-success)' }}>${(deal.netBrokerageRevenue || 0).toLocaleString()}</span></div>
                </div>

                {toast && <div className={`${s.toast} ${s.toastSuccess}`}>{toast}</div>}
            </div>
        );
    }

    return (
        <>
            <div className={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div className={s.cardTitle} style={{ marginBottom: 0 }}>Edit Deal</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`} onClick={() => { setForm({ ...deal, lenderId: currentLenderId }); setEditing(false); }}>Cancel</button>
                        <button className={`${s.btn} ${s.btnPrimary} ${s.btnSmall}`} onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                    <div style={{ padding: '8px 16px', backgroundColor: 'var(--bb-bg)', borderRadius: 8, fontSize: 14 }}>
                        <strong>LTV:</strong> {ltv}%
                    </div>
                </div>

                <div className={s.grid2}>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Stage</label>
                        <select className={s.formInput} value={form.stage} onChange={e => update('stage', e.target.value)}>
                            {STAGES.map(st => <option key={st} value={st}>{st.replace('_', ' ').toUpperCase()}</option>)}
                        </select>
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Priority</label>
                        <select className={s.formInput} value={form.priority} onChange={e => update('priority', e.target.value)}>
                            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Property Address</label>
                        <input className={s.formInput} value={form.propertyAddress || ''} onChange={e => update('propertyAddress', e.target.value)} />
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Property Type</label>
                        <select className={s.formInput} value={form.propertyType} onChange={e => update('propertyType', e.target.value)}>
                            {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Property Value</label>
                        <input className={s.formInput} type="number" value={form.propertyValue} onChange={e => update('propertyValue', Number(e.target.value))} />
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Loan Amount</label>
                        <input className={s.formInput} type="number" value={form.loanAmount} onChange={e => update('loanAmount', Number(e.target.value))} />
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Interest Rate (%)</label>
                        <input className={s.formInput} type="number" step="0.01" value={form.interestRate || ''} onChange={e => update('interestRate', e.target.value ? Number(e.target.value) : null)} />
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Position</label>
                        <select className={s.formInput} value={form.position} onChange={e => update('position', e.target.value)}>
                            {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Loan Purpose</label>
                        <select className={s.formInput} value={form.loanPurpose} onChange={e => update('loanPurpose', e.target.value)}>
                            {PURPOSES.map(p => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
                        </select>
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Occupancy</label>
                        <select className={s.formInput} value={form.occupancyType} onChange={e => update('occupancyType', e.target.value)}>
                            {OCCUPANCY_TYPES.map(o => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
                        </select>
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Term (months)</label>
                        <input className={s.formInput} type="number" value={form.termMonths} onChange={e => update('termMonths', Number(e.target.value))} />
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Amortization (months)</label>
                        <input className={s.formInput} type="number" value={form.amortMonths} onChange={e => update('amortMonths', Number(e.target.value))} />
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Assigned Lender</label>
                        <select className={s.formInput} value={form.lenderId || ''} onChange={e => update('lenderId', e.target.value || null)}>
                            <option value="">Unassigned</option>
                            {lenders.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Broker Fee (%)</label>
                        <input className={s.formInput} type="number" step="0.01" value={form.brokerFee || ''} onChange={e => update('brokerFee', e.target.value ? Number(e.target.value) : null)} />
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Lender Fee (%)</label>
                        <input className={s.formInput} type="number" step="0.01" value={form.lenderFee || ''} onChange={e => update('lenderFee', e.target.value ? Number(e.target.value) : null)} />
                    </div>
                </div>

                <div className={s.grid2} style={{ marginTop: 16 }}>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Agent Commission Split (%)</label>
                        <input className={s.formInput} type="number" step="1" value={form.agentCommissionSplit} onChange={e => update('agentCommissionSplit', Number(e.target.value))} />
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Exit Strategy</label>
                        <input className={s.formInput} value={form.exitStrategy || ''} onChange={e => update('exitStrategy', e.target.value)} placeholder="e.g. Refinance to conventional" />
                    </div>
                </div>
                <div className={s.formGroup}>
                    <label className={s.formLabel}>Notes</label>
                    <textarea className={s.formInput} rows={3} value={form.notes || ''} onChange={e => update('notes', e.target.value)} style={{ resize: 'vertical' }} />
                </div>
            </div>
            {toast && <div className={`${s.toast} ${toast.includes('Error') ? s.toastError : s.toastSuccess}`}>{toast}</div>}
        </>
    );
}
