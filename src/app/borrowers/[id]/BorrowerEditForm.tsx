'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import s from '@/styles/shared.module.css';

interface BorrowerEditFormProps {
    borrower: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
        address: string | null;
        city: string | null;
        province: string;
        postalCode: string | null;
        income: number;
        verifiedIncome: number | null;
        employmentStatus: string;
        borrowerType: string;
        liabilities: number;
        creditScore: number;
        coBorrowerName: string | null;
        coBorrowerEmail: string | null;
        notes: string | null;
        status: string;
    };
}

const PROVINCES = ['ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'YT', 'NU'];
const EMPLOYMENT_TYPES = ['employed', 'self-employed', 'retired', 'unemployed', 'student'];
const BORROWER_TYPES = ['primary', 'co-borrower', 'guarantor'];

export default function BorrowerEditForm({ borrower }: BorrowerEditFormProps) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [form, setForm] = useState(borrower);

    function update(field: string, value: string | number | null) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    async function handleSave() {
        setSaving(true);
        const res = await fetch(`/api/borrowers/${borrower.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                phone: form.phone || null,
                address: form.address || null,
                city: form.city || null,
                province: form.province,
                postalCode: form.postalCode || null,
                income: Number(form.income) || 0,
                verifiedIncome: form.verifiedIncome ? Number(form.verifiedIncome) : null,
                employmentStatus: form.employmentStatus,
                borrowerType: form.borrowerType,
                liabilities: Number(form.liabilities) || 0,
                creditScore: Number(form.creditScore) || 650,
                coBorrowerName: form.coBorrowerName || null,
                coBorrowerEmail: form.coBorrowerEmail || null,
                notes: form.notes || null,
                status: form.status,
            }),
        });
        setSaving(false);
        if (res.ok) {
            setToast('Borrower updated!');
            setTimeout(() => setToast(''), 3000);
            setEditing(false);
            router.refresh();
        } else {
            setToast('Error saving changes');
            setTimeout(() => setToast(''), 3000);
        }
    }

    function handleCancel() {
        setForm(borrower);
        setEditing(false);
    }

    if (!editing) {
        return (
            <>
                <div className={s.grid2}>
                    <div className={s.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div className={s.cardTitle} style={{ marginBottom: 0 }}>Contact Information</div>
                            <button className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`} onClick={() => setEditing(true)}>Edit</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                            <div><strong>Email:</strong> {borrower.email}</div>
                            <div><strong>Phone:</strong> {borrower.phone || '—'}</div>
                            <div><strong>Address:</strong> {borrower.address || '—'}, {borrower.city || ''} {borrower.province} {borrower.postalCode || ''}</div>
                            <div><strong>Liabilities:</strong> ${borrower.liabilities.toLocaleString()}</div>
                            <div><strong>Employment:</strong> {borrower.employmentStatus}</div>
                            <div><strong>Type:</strong> {borrower.borrowerType}</div>
                            {borrower.verifiedIncome && <div><strong>Verified Income:</strong> ${borrower.verifiedIncome.toLocaleString()}</div>}
                            {borrower.coBorrowerName && <div><strong>Co-Borrower:</strong> {borrower.coBorrowerName} ({borrower.coBorrowerEmail || 'no email'})</div>}
                            {borrower.notes && (
                                <div style={{ marginTop: 8, padding: 12, backgroundColor: 'var(--bb-bg)', borderRadius: 6, fontSize: 13 }}>
                                    <strong>Notes:</strong> {borrower.notes}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {toast && <div className={`${s.toast} ${s.toastSuccess}`}>{toast}</div>}
            </>
        );
    }

    return (
        <>
            <div className={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div className={s.cardTitle} style={{ marginBottom: 0 }}>Edit Borrower</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`} onClick={handleCancel}>Cancel</button>
                        <button className={`${s.btn} ${s.btnPrimary} ${s.btnSmall}`} onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                <div className={s.grid2}>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>First Name</label>
                        <input className={s.formInput} value={form.firstName} onChange={e => update('firstName', e.target.value)} required />
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Last Name</label>
                        <input className={s.formInput} value={form.lastName} onChange={e => update('lastName', e.target.value)} required />
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Email</label>
                        <input className={s.formInput} type="email" value={form.email} onChange={e => update('email', e.target.value)} required />
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Phone</label>
                        <input className={s.formInput} value={form.phone || ''} onChange={e => update('phone', e.target.value)} />
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Address</label>
                        <input className={s.formInput} value={form.address || ''} onChange={e => update('address', e.target.value)} />
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>City</label>
                        <input className={s.formInput} value={form.city || ''} onChange={e => update('city', e.target.value)} />
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Province</label>
                        <select className={s.formInput} value={form.province} onChange={e => update('province', e.target.value)}>
                            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Postal Code</label>
                        <input className={s.formInput} value={form.postalCode || ''} onChange={e => update('postalCode', e.target.value)} />
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Annual Income</label>
                        <input className={s.formInput} type="number" value={form.income} onChange={e => update('income', Number(e.target.value))} />
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Verified Income</label>
                        <input className={s.formInput} type="number" value={form.verifiedIncome || ''} onChange={e => update('verifiedIncome', e.target.value ? Number(e.target.value) : null)} />
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Employment Status</label>
                        <select className={s.formInput} value={form.employmentStatus} onChange={e => update('employmentStatus', e.target.value)}>
                            {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Borrower Type</label>
                        <select className={s.formInput} value={form.borrowerType} onChange={e => update('borrowerType', e.target.value)}>
                            {BORROWER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Credit Score</label>
                        <input className={s.formInput} type="number" value={form.creditScore} min={300} max={900} onChange={e => update('creditScore', Number(e.target.value))} />
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Monthly Liabilities</label>
                        <input className={s.formInput} type="number" value={form.liabilities} onChange={e => update('liabilities', Number(e.target.value))} />
                    </div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Status</label>
                        <select className={s.formInput} value={form.status} onChange={e => update('status', e.target.value)}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginTop: 16, borderTop: '1px solid var(--bb-border)', paddingTop: 16 }}>
                    <div className={s.cardTitle} style={{ fontSize: 14 }}>Co-Borrower</div>
                    <div className={s.grid2}>
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Co-Borrower Name</label>
                            <input className={s.formInput} value={form.coBorrowerName || ''} onChange={e => update('coBorrowerName', e.target.value)} />
                        </div>
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Co-Borrower Email</label>
                            <input className={s.formInput} type="email" value={form.coBorrowerEmail || ''} onChange={e => update('coBorrowerEmail', e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className={s.formGroup} style={{ marginTop: 16 }}>
                    <label className={s.formLabel}>Internal Notes</label>
                    <textarea className={s.formInput} rows={3} value={form.notes || ''} onChange={e => update('notes', e.target.value)} style={{ resize: 'vertical' }} />
                </div>
            </div>
            {toast && <div className={`${s.toast} ${toast.includes('Error') ? s.toastError : s.toastSuccess}`}>{toast}</div>}
        </>
    );
}
