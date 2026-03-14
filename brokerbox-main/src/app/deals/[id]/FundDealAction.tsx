'use client';

import { useState } from 'react';
import s from '@/styles/shared.module.css';

export default function FundDealAction({ deal }: any) {
    const [open, setOpen] = useState(false);

    async function handleFund(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const data = Object.fromEntries(fd.entries());

        const res = await fetch(`/api/deals/${deal.id}/loan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            setOpen(false);
            window.location.reload();
        }
    }

    if (deal.loan) return null; // Already funded

    return (
        <>
            <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => setOpen(true)}>
                Fund Deal & Track Loan
            </button>

            {open && (
                <div className={s.modal}>
                    <div className={s.modalBackdrop} onClick={() => setOpen(false)} />
                    <div className={s.modalContent}>
                        <div className={s.modalHeader}>
                            <div className={s.modalTitle}>Fund Deal: {deal.propertyAddress}</div>
                            <button className={s.modalClose} onClick={() => setOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleFund}>
                            <div className={s.grid2}>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Funded Date</label>
                                    <input type="date" name="fundedDate" required className={s.formInput} defaultValue={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Maturity Date</label>
                                    <input type="date" name="maturityDate" required className={s.formInput} />
                                </div>
                            </div>

                            <div className={s.grid2}>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Principal Balance ($)</label>
                                    <input type="number" name="principalBalance" required className={s.formInput} defaultValue={deal.loanAmount} />
                                </div>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Actual Interest Rate (%)</label>
                                    <input type="number" name="interestRate" step="0.01" required className={s.formInput} defaultValue={deal.interestRate} />
                                </div>
                            </div>

                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Interest Type</label>
                                <select name="interestType" className={s.formInput}>
                                    <option value="fixed">Fixed</option>
                                    <option value="variable">Variable</option>
                                </select>
                            </div>

                            <div className={s.modalActions}>
                                <button type="button" className={`${s.btn} ${s.btnSecondary}`} onClick={() => setOpen(false)}>Cancel</button>
                                <button type="submit" className={`${s.btn} ${s.btnPrimary}`}>Create Loan Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
