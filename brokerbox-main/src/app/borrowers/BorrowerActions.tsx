'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import s from '@/styles/shared.module.css';

export default function BorrowerActions() {
    const [open, setOpen] = useState(false);
    const [toast, setToast] = useState('');
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const res = await fetch('/api/borrowers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: fd.get('firstName'),
                lastName: fd.get('lastName'),
                email: fd.get('email'),
                phone: fd.get('phone'),
                province: fd.get('province') || 'ON',
                income: Number(fd.get('income')) || 0,
                creditScore: Number(fd.get('creditScore')) || 650,
                employmentStatus: fd.get('employmentStatus') || 'employed',
            }),
        });
        if (res.ok) {
            setOpen(false);
            setToast('Borrower created!');
            setTimeout(() => setToast(''), 3000);
            router.refresh();
        }
    }

    return (
        <>
            <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => setOpen(true)}>+ Add Borrower</button>

            {open && (
                <div className={s.modal}>
                    <div className={s.modalBackdrop} onClick={() => setOpen(false)} />
                    <div className={s.modalContent}>
                        <div className={s.modalHeader}>
                            <div className={s.modalTitle}>New Borrower</div>
                            <button className={s.modalClose} onClick={() => setOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={s.grid2}>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>First Name</label>
                                    <input name="firstName" className={s.formInput} required />
                                </div>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Last Name</label>
                                    <input name="lastName" className={s.formInput} required />
                                </div>
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Email</label>
                                <input name="email" type="email" className={s.formInput} required />
                            </div>
                            <div className={s.grid2}>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Phone</label>
                                    <input name="phone" className={s.formInput} />
                                </div>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Province</label>
                                    <select name="province" className={s.formInput}>
                                        {['ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'YT', 'NU'].map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className={s.grid2}>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Annual Income</label>
                                    <input name="income" type="number" className={s.formInput} />
                                </div>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Credit Score</label>
                                    <input name="creditScore" type="number" className={s.formInput} defaultValue={650} />
                                </div>
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Employment Status</label>
                                <select name="employmentStatus" className={s.formInput}>
                                    <option value="employed">Employed</option>
                                    <option value="self-employed">Self-Employed</option>
                                    <option value="retired">Retired</option>
                                    <option value="unemployed">Unemployed</option>
                                </select>
                            </div>
                            <div className={s.modalActions}>
                                <button type="button" className={`${s.btn} ${s.btnSecondary}`} onClick={() => setOpen(false)}>Cancel</button>
                                <button type="submit" className={`${s.btn} ${s.btnPrimary}`}>Create Borrower</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && <div className={`${s.toast} ${s.toastSuccess}`}>{toast}</div>}
        </>
    );
}
