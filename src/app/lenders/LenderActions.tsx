'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import s from '@/styles/shared.module.css';

export default function LenderActions() {
    const [open, setOpen] = useState(false);
    const [toast, setToast] = useState('');
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const res = await fetch('/api/lenders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: fd.get('name'),
                contactEmail: fd.get('contactEmail'),
                minCreditScore: Number(fd.get('minCreditScore')) || 600,
                maxLTV: Number(fd.get('maxLTV')) || 80,
                maxGDS: Number(fd.get('maxGDS')) || 39,
                maxTDS: Number(fd.get('maxTDS')) || 44,
                baseRate: Number(fd.get('baseRate')) || 5.5,
                supportedProvinces: (fd.get('supportedProvinces') as string || 'ON').split(',').map(s => s.trim()),
                propertyTypes: (fd.get('propertyTypes') as string || 'residential').split(',').map(s => s.trim()),
            }),
        });
        if (res.ok) {
            setOpen(false);
            setToast('Lender created!');
            setTimeout(() => setToast(''), 3000);
            router.refresh();
        }
    }

    return (
        <>
            <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => setOpen(true)}>+ Add Lender</button>

            {open && (
                <div className={s.modal}>
                    <div className={s.modalBackdrop} onClick={() => setOpen(false)} />
                    <div className={s.modalContent}>
                        <div className={s.modalHeader}>
                            <div className={s.modalTitle}>New Lender</div>
                            <button className={s.modalClose} onClick={() => setOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Lender Name</label>
                                <input name="name" className={s.formInput} required />
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Contact Email</label>
                                <input name="contactEmail" type="email" className={s.formInput} />
                            </div>
                            <div className={s.grid2}>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Min Credit Score</label>
                                    <input name="minCreditScore" type="number" className={s.formInput} defaultValue={600} />
                                </div>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Max LTV %</label>
                                    <input name="maxLTV" type="number" className={s.formInput} defaultValue={80} />
                                </div>
                            </div>
                            <div className={s.grid2}>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Max GDS %</label>
                                    <input name="maxGDS" type="number" className={s.formInput} defaultValue={39} />
                                </div>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Max TDS %</label>
                                    <input name="maxTDS" type="number" className={s.formInput} defaultValue={44} />
                                </div>
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Base Rate %</label>
                                <input name="baseRate" type="number" step="0.01" className={s.formInput} defaultValue={5.5} />
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Supported Provinces (comma-separated)</label>
                                <input name="supportedProvinces" className={s.formInput} defaultValue="ON, BC, AB" />
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Property Types (comma-separated)</label>
                                <input name="propertyTypes" className={s.formInput} defaultValue="residential, commercial" />
                            </div>
                            <div className={s.modalActions}>
                                <button type="button" className={`${s.btn} ${s.btnSecondary}`} onClick={() => setOpen(false)}>Cancel</button>
                                <button type="submit" className={`${s.btn} ${s.btnPrimary}`}>Create Lender</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && <div className={`${s.toast} ${s.toastSuccess}`}>{toast}</div>}
        </>
    );
}
