'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import s from '@/styles/shared.module.css';

interface LenderEditFormProps {
    lender: any;
}

const PROVINCES = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];
const POSITIONS = ['1st', '2nd', '3rd', 'bridge'];
const CATEGORIES = ['residential', 'commercial', 'land', 'construction', 'bridge'];
const PROP_TYPES = ['residential', 'condo', 'commercial', 'multi-unit', 'land', 'construction'];

export default function LenderEditForm({ lender }: LenderEditFormProps) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [form, setForm] = useState(lender);

    function update(field: string, value: any) {
        setForm((prev: any) => ({ ...prev, [field]: value }));
    }

    function toggleArrayItem(field: string, value: string) {
        setForm((prev: any) => {
            const arr = prev[field] as string[];
            if (arr.includes(value)) {
                return { ...prev, [field]: arr.filter(v => v !== value) };
            }
            return { ...prev, [field]: [...arr, value] };
        });
    }

    async function handleSave() {
        setSaving(true);
        // Clean payload
        const payload = { ...form };
        delete payload.id;
        delete payload.createdAt;
        delete payload.updatedAt;
        delete payload.deals;

        // Ensure numbers
        ['minCreditScore', 'maxLTV', 'maxGDS', 'maxTDS', 'minLoan', 'maxLoan', 'termMin', 'termMax', 'pricingPremium', 'baseRate', 'lenderFees', 'speed', 'exceptionsTolerance', 'appetite', 'capitalAvailable', 'capitalCommitted'].forEach(k => {
            payload[k] = Number(payload[k]);
        });

        const res = await fetch(`/api/lenders/${lender.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        setSaving(false);
        if (res.ok) {
            setToast('Saved successfully!');
            setTimeout(() => setToast(''), 3000);
            setEditing(false);
            router.refresh();
        } else {
            setToast('Error saving data.');
            setTimeout(() => setToast(''), 3000);
        }
    }

    if (!editing) {
        return (
            <div className={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div className={s.cardTitle} style={{ marginBottom: 0 }}>Lender Profile & Criteria</div>
                    <button className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`} onClick={() => setEditing(true)}>Edit</button>
                </div>

                <div className={s.grid2}>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--bb-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Contact & Status</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Name:</span> <span>{lender.contactName || '—'}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Email:</span> <span>{lender.contactEmail || '—'}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Phone:</span> <span>{lender.contactPhone || '—'}</span></div>
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--bb-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Capital & Pricing</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Base Rate:</span> <span>{lender.baseRate}%</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Lender Fee:</span> <span>{lender.lenderFees}%</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pricing Premium:</span> <span>+{lender.pricingPremium}%</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Capital Available:</span> <span>${(lender.capitalAvailable / 1e6).toFixed(2)}M</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Capital Committed:</span> <span>${(lender.capitalCommitted / 1e6).toFixed(2)}M</span></div>
                        </div>
                    </div>
                </div>

                <div style={{ height: 1, backgroundColor: 'var(--bb-border)', margin: '16px 0' }} />

                <div className={s.grid2}>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--bb-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Hard Criteria</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Loan Size:</span> <span>${(lender.minLoan / 1000).toFixed(0)}k - ${(lender.maxLoan / 1e6).toFixed(1)}M</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Term:</span> <span>{lender.termMin} - {lender.termMax} months</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Min Credit:</span> <span>{lender.minCreditScore}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Max LTV:</span> <span>{lender.maxLTV}%</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Max GDS/TDS:</span> <span>{lender.maxGDS}% / {lender.maxTDS}%</span></div>
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--bb-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Preferences & Scoring</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Appetite Score:</span> <span>{lender.appetite}/10</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Funding Speed:</span> <span>{lender.speed}/10</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Exception Tolerance:</span> <span>{lender.exceptionsTolerance}/10</span></div>
                        </div>
                    </div>
                </div>

                <div style={{ height: 1, backgroundColor: 'var(--bb-border)', margin: '16px 0' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ color: 'var(--bb-muted)', width: 140 }}>Product Categories:</span>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{lender.productCategories.map((c: string) => <span key={c} className={`${s.pill} ${s.pillGray}`}>{c}</span>)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ color: 'var(--bb-muted)', width: 140 }}>Position Types:</span>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{lender.positionTypes.map((c: string) => <span key={c} className={`${s.pill} ${s.pillBlue}`}>{c}</span>)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ color: 'var(--bb-muted)', width: 140 }}>Property Types:</span>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{lender.propertyTypes.map((c: string) => <span key={c} className={`${s.pill} ${s.pillGray}`}>{c}</span>)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ color: 'var(--bb-muted)', width: 140 }}>Provinces:</span>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{lender.supportedProvinces.map((c: string) => <span key={c} className={`${s.pill} ${s.pillGray}`}>{c}</span>)}</div>
                    </div>
                </div>

                {lender.notes && (
                    <div style={{ marginTop: 16, padding: 12, backgroundColor: 'var(--bb-bg)', borderRadius: 6, fontSize: 13 }}>
                        <strong>General Notes:</strong> {lender.notes}
                    </div>
                )}
                {lender.underwritingNotes && (
                    <div style={{ marginTop: 8, padding: 12, backgroundColor: 'var(--bb-bg)', borderRadius: 6, fontSize: 13 }}>
                        <strong>Underwriting Notes:</strong> {lender.underwritingNotes}
                    </div>
                )}

                {toast && <div className={`${s.toast} ${s.toastSuccess}`}>{toast}</div>}
            </div>
        );
    }

    return (
        <>
            <div className={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div className={s.cardTitle} style={{ marginBottom: 0 }}>Edit Lender</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`} onClick={() => { setForm(lender); setEditing(false); }}>Cancel</button>
                        <button className={`${s.btn} ${s.btnPrimary} ${s.btnSmall}`} onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* Status Options */}
                <div style={{ marginBottom: 20 }}>
                    <label className={s.formLabel}>Status</label>
                    <select className={s.formInput} value={form.status} onChange={e => update('status', e.target.value)} style={{ width: 200 }}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                {/* Toggles Group */}
                <div className={s.grid2} style={{ marginBottom: 20 }}>
                    <div>
                        <label className={s.formLabel}>Product Categories</label>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {CATEGORIES.map(c => (
                                <button key={c} className={`${s.pill} ${form.productCategories.includes(c) ? s.pillBlue : s.pillGray}`} style={{ cursor: 'pointer', border: 'none' }} onClick={() => toggleArrayItem('productCategories', c)}>
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className={s.formLabel}>Position Types</label>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {POSITIONS.map(c => (
                                <button key={c} className={`${s.pill} ${form.positionTypes.includes(c) ? s.pillBlue : s.pillGray}`} style={{ cursor: 'pointer', border: 'none' }} onClick={() => toggleArrayItem('positionTypes', c)}>
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <label className={s.formLabel}>Property Types</label>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {PROP_TYPES.map(c => (
                                <button key={c} className={`${s.pill} ${form.propertyTypes.includes(c) ? s.pillBlue : s.pillGray}`} style={{ cursor: 'pointer', border: 'none' }} onClick={() => toggleArrayItem('propertyTypes', c)}>
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <label className={s.formLabel}>Supported Provinces</label>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {PROVINCES.map(c => (
                                <button key={c} className={`${s.pill} ${form.supportedProvinces.includes(c) ? s.pillBlue : s.pillGray}`} style={{ cursor: 'pointer', border: 'none' }} onClick={() => toggleArrayItem('supportedProvinces', c)}>
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={s.grid2}>
                    {/* Contact & Basics */}
                    <div className={s.formGroup}><label className={s.formLabel}>Name</label><input className={s.formInput} value={form.name} onChange={e => update('name', e.target.value)} /></div>
                    <div className={s.formGroup}><label className={s.formLabel}>Contact Name</label><input className={s.formInput} value={form.contactName || ''} onChange={e => update('contactName', e.target.value)} /></div>
                    <div className={s.formGroup}><label className={s.formLabel}>Contact Email</label><input className={s.formInput} value={form.contactEmail || ''} onChange={e => update('contactEmail', e.target.value)} /></div>
                    <div className={s.formGroup}><label className={s.formLabel}>Contact Phone</label><input className={s.formInput} value={form.contactPhone || ''} onChange={e => update('contactPhone', e.target.value)} /></div>

                    {/* Hard Criteria */}
                    <div className={s.formGroup}><label className={s.formLabel}>Min Loan Amount</label><input className={s.formInput} type="number" value={form.minLoan} onChange={e => update('minLoan', e.target.value)} /></div>
                    <div className={s.formGroup}><label className={s.formLabel}>Max Loan Amount</label><input className={s.formInput} type="number" value={form.maxLoan} onChange={e => update('maxLoan', e.target.value)} /></div>
                    <div className={s.formGroup}><label className={s.formLabel}>Min Term (mos)</label><input className={s.formInput} type="number" value={form.termMin} onChange={e => update('termMin', e.target.value)} /></div>
                    <div className={s.formGroup}><label className={s.formLabel}>Max Term (mos)</label><input className={s.formInput} type="number" value={form.termMax} onChange={e => update('termMax', e.target.value)} /></div>
                    <div className={s.formGroup}><label className={s.formLabel}>Min Credit Score</label><input className={s.formInput} type="number" value={form.minCreditScore} onChange={e => update('minCreditScore', e.target.value)} /></div>
                    <div className={s.formGroup}><label className={s.formLabel}>Max LTV (%)</label><input className={s.formInput} type="number" value={form.maxLTV} onChange={e => update('maxLTV', e.target.value)} /></div>
                    <div className={s.formGroup}><label className={s.formLabel}>Max GDS (%)</label><input className={s.formInput} type="number" value={form.maxGDS} onChange={e => update('maxGDS', e.target.value)} /></div>
                    <div className={s.formGroup}><label className={s.formLabel}>Max TDS (%)</label><input className={s.formInput} type="number" value={form.maxTDS} onChange={e => update('maxTDS', e.target.value)} /></div>

                    {/* Pricing & Scoring */}
                    <div className={s.formGroup}><label className={s.formLabel}>Base Rate (%)</label><input className={s.formInput} type="number" step="0.01" value={form.baseRate} onChange={e => update('baseRate', e.target.value)} /></div>
                    <div className={s.formGroup}><label className={s.formLabel}>Lender Fee (%)</label><input className={s.formInput} type="number" step="0.01" value={form.lenderFees} onChange={e => update('lenderFees', e.target.value)} /></div>
                    <div className={s.formGroup}><label className={s.formLabel}>Pricing Premium (%)</label><input className={s.formInput} type="number" step="0.01" value={form.pricingPremium} onChange={e => update('pricingPremium', e.target.value)} /></div>
                    <div className={s.formGroup}><label className={s.formLabel}>Speed Score (1-10)</label><input className={s.formInput} type="number" min="1" max="10" value={form.speed} onChange={e => update('speed', e.target.value)} /></div>
                    <div className={s.formGroup}><label className={s.formLabel}>Tolerance Score (1-10)</label><input className={s.formInput} type="number" min="1" max="10" value={form.exceptionsTolerance} onChange={e => update('exceptionsTolerance', e.target.value)} /></div>
                    <div className={s.formGroup}><label className={s.formLabel}>Appetite Score (1-10)</label><input className={s.formInput} type="number" min="1" max="10" value={form.appetite} onChange={e => update('appetite', e.target.value)} /></div>

                    {/* Capital */}
                    <div className={s.formGroup}><label className={s.formLabel}>Capital Available</label><input className={s.formInput} type="number" value={form.capitalAvailable} onChange={e => update('capitalAvailable', e.target.value)} /></div>
                    <div className={s.formGroup}><label className={s.formLabel}>Capital Committed</label><input className={s.formInput} type="number" value={form.capitalCommitted} onChange={e => update('capitalCommitted', e.target.value)} /></div>
                </div>

                <div className={s.formGroup} style={{ marginTop: 16 }}>
                    <label className={s.formLabel}>General Notes</label>
                    <textarea className={s.formInput} rows={2} value={form.notes || ''} onChange={e => update('notes', e.target.value)} />
                </div>
                <div className={s.formGroup}>
                    <label className={s.formLabel}>Underwriting Notes</label>
                    <textarea className={s.formInput} rows={3} value={form.underwritingNotes || ''} onChange={e => update('underwritingNotes', e.target.value)} />
                </div>
            </div>
            {toast && <div className={`${s.toast} ${toast.includes('Error') ? s.toastError : s.toastSuccess}`}>{toast}</div>}
        </>
    );
}
