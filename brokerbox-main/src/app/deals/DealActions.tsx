'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import s from '@/styles/shared.module.css';

interface Borrower { id: string; firstName: string; lastName: string; }

export default function DealActions() {
    const [open, setOpen] = useState(false);
    const [toast, setToast] = useState('');
    const [borrowers, setBorrowers] = useState<Borrower[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (open) fetch('/api/borrowers').then(r => r.json()).then(setBorrowers);
    }, [open]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const res = await fetch('/api/deals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                borrowerId: fd.get('borrowerId'),
                propertyAddress: fd.get('propertyAddress'),
                propertyValue: Number(fd.get('propertyValue')) || 0,
                loanAmount: Number(fd.get('loanAmount')) || 0,
                termMonths: Number(fd.get('termMonths')) || 300,
                stage: 'intake',
            }),
        });
        if (res.ok) {
            setOpen(false);
            setToast('Deal created!');
            setTimeout(() => setToast(''), 3000);
            router.refresh();
        }
    }

    return (
        <>
            <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => setOpen(true)}>+ New Deal</button>

            {open && (
                <div className={s.modal}>
                    <div className={s.modalBackdrop} onClick={() => setOpen(false)} />
                    <div className={s.modalContent}>
                        <div className={s.modalHeader}>
                            <div className={s.modalTitle}>New Deal</div>
                            <button className={s.modalClose} onClick={() => setOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Borrower</label>
                                <select name="borrowerId" className={s.formInput} required>
                                    <option value="">Select borrower...</option>
                                    {borrowers.map(b => <option key={b.id} value={b.id}>{b.firstName} {b.lastName}</option>)}
                                </select>
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Property Address</label>
                                <input name="propertyAddress" className={s.formInput} />
                            </div>
                            <div className={s.grid2}>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Property Value</label>
                                    <input name="propertyValue" type="number" className={s.formInput} />
                                </div>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Loan Amount</label>
                                    <input name="loanAmount" type="number" className={s.formInput} />
                                </div>
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Amortization (months)</label>
                                <input name="termMonths" type="number" className={s.formInput} defaultValue={300} />
                            </div>
                            <div className={s.modalActions}>
                                <button type="button" className={`${s.btn} ${s.btnSecondary}`} onClick={() => setOpen(false)}>Cancel</button>
                                <button type="submit" className={`${s.btn} ${s.btnPrimary}`}>Create Deal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && <div className={`${s.toast} ${s.toastSuccess}`}>{toast}</div>}
        </>
    );
}
