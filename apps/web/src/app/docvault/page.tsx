'use client';
import { useState, useEffect } from 'react';
import s from '@/styles/shared.module.css';

interface Borrower { id: string; firstName: string; lastName: string; }
interface DocReq { id: string; docType: string; status: string; borrowerId: string; notes: string | null; createdAt: string; files: { id: string; filename: string; version: number; uploadedAt: string }[]; }

export default function DocVaultPage() {
    const [borrowers, setBorrowers] = useState<Borrower[]>([]);
    const [docs, setDocs] = useState<DocReq[]>([]);
    const [toast, setToast] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [uploadTarget, setUploadTarget] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/borrowers').then(r => r.json()).then(setBorrowers);
        loadDocs();
    }, []);

    function loadDocs() {
        fetch('/api/docvault').then(r => r.json()).then(setDocs);
    }

    async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const res = await fetch('/api/docvault', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ borrowerId: fd.get('borrowerId'), docType: fd.get('docType'), notes: fd.get('notes') }),
        });
        if (res.ok) {
            setCreateOpen(false);
            setToast('Document request created!');
            setTimeout(() => setToast(''), 3000);
            loadDocs();
        }
    }

    async function handleUpload(docRequestId: string, e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('file', file);
        fd.append('docRequestId', docRequestId);
        await fetch('/api/docvault/upload', { method: 'POST', body: fd });
        setToast('File uploaded!');
        setTimeout(() => setToast(''), 3000);
        setUploadTarget(null);
        loadDocs();
    }

    async function updateStatus(id: string, status: string) {
        await fetch(`/api/docvault/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        loadDocs();
    }

    const statusColor = (st: string) => st === 'verified' ? s.pillGreen : st === 'uploaded' ? s.pillBlue : st === 'rejected' ? s.pillRed : s.pillYellow;

    return (
        <>
            <div className={s.pageHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>📁 DocVault</h1>
                        <p>Manage document requests and uploads</p>
                    </div>
                    <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => setCreateOpen(true)}>+ New Request</button>
                </div>
            </div>

            {/* Stats */}
            <div className={s.kpiRow} style={{ marginBottom: 24 }}>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Total Requests</div><div className={s.kpiValue}>{docs.length}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Pending</div><div className={s.kpiValue}>{docs.filter(d => d.status === 'requested').length}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Uploaded</div><div className={s.kpiValue}>{docs.filter(d => d.status === 'uploaded').length}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Verified</div><div className={s.kpiValue}>{docs.filter(d => d.status === 'verified').length}</div></div>
            </div>

            <div className={s.card}>
                <table className={s.table}>
                    <thead><tr><th>Document Type</th><th>Borrower</th><th>Status</th><th>Files</th><th>Actions</th></tr></thead>
                    <tbody>
                        {docs.map(d => {
                            const borrower = borrowers.find(b => b.id === d.borrowerId);
                            return (
                                <tr key={d.id}>
                                    <td style={{ fontWeight: 600 }}>{d.docType}</td>
                                    <td>{borrower ? `${borrower.firstName} ${borrower.lastName}` : d.borrowerId.slice(-6)}</td>
                                    <td><span className={`${s.pill} ${statusColor(d.status)}`}>{d.status}</span></td>
                                    <td>{d.files.length > 0 ? d.files.map(f => <div key={f.id} style={{ fontSize: 12 }}>{f.filename} (v{f.version})</div>) : <span style={{ color: 'var(--bb-muted)', fontSize: 12 }}>No files</span>}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {uploadTarget === d.id ? (
                                                <input type="file" onChange={e => handleUpload(d.id, e)} style={{ fontSize: 12 }} />
                                            ) : (
                                                <button className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`} onClick={() => setUploadTarget(d.id)}>Upload</button>
                                            )}
                                            {d.status === 'uploaded' && (
                                                <>
                                                    <button className={`${s.btn} ${s.btnSmall}`} style={{ background: 'var(--bb-success)', color: '#fff' }} onClick={() => updateStatus(d.id, 'verified')}>Verify</button>
                                                    <button className={`${s.btn} ${s.btnDanger} ${s.btnSmall}`} onClick={() => updateStatus(d.id, 'rejected')}>Reject</button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {createOpen && (
                <div className={s.modal}>
                    <div className={s.modalBackdrop} onClick={() => setCreateOpen(false)} />
                    <div className={s.modalContent}>
                        <div className={s.modalHeader}>
                            <div className={s.modalTitle}>New Document Request</div>
                            <button className={s.modalClose} onClick={() => setCreateOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Borrower</label>
                                <select name="borrowerId" className={s.formInput} required>
                                    <option value="">Select...</option>
                                    {borrowers.map(b => <option key={b.id} value={b.id}>{b.firstName} {b.lastName}</option>)}
                                </select>
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Document Type</label>
                                <select name="docType" className={s.formInput} required>
                                    {['T4 Slips', 'Notice of Assessment', 'Pay Stubs', 'Letter of Employment', 'Bank Statements', 'Photo ID', 'Proof of Down Payment', 'MLS Listing', 'Property Appraisal', 'Mortgage Statement', 'Property Tax Bill', 'Insurance Certificate'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Notes</label>
                                <input name="notes" className={s.formInput} />
                            </div>
                            <div className={s.modalActions}>
                                <button type="button" className={`${s.btn} ${s.btnSecondary}`} onClick={() => setCreateOpen(false)}>Cancel</button>
                                <button type="submit" className={`${s.btn} ${s.btnPrimary}`}>Create Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && <div className={`${s.toast} ${s.toastSuccess}`}>{toast}</div>}
        </>
    );
}
