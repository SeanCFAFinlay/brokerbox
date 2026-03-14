'use client';
import { useState, useEffect, useMemo } from 'react';
import s from '@/styles/shared.module.css';

interface Borrower { id: string; firstName: string; lastName: string; }
interface Deal { id: string; propertyAddress: string; loanAmount: number; stage: string; }
interface DocReq { id: string; docType: string; category: string; status: string; expiresAt: string | null; borrowerId: string; dealId: string | null; notes: string | null; createdAt: string; files: { id: string; filename: string; version: number; uploadedAt: string }[]; deal?: { propertyAddress: string }; }

export default function DocVaultPage() {
    const [borrowers, setBorrowers] = useState<Borrower[]>([]);
    const [docs, setDocs] = useState<DocReq[]>([]);
    const [toast, setToast] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [uploadTarget, setUploadTarget] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Create Modal state
    const [selectedBorrower, setSelectedBorrower] = useState('');
    const [borrowerDeals, setBorrowerDeals] = useState<Deal[]>([]);

    useEffect(() => {
        fetch('/api/borrowers').then(r => r.json()).then(setBorrowers);
        loadDocs();
    }, []);

    useEffect(() => {
        if (selectedBorrower) {
            fetch(`/api/borrowers/${selectedBorrower}`).then(r => r.json()).then(data => {
                setBorrowerDeals(data.deals || []);
            });
        } else {
            setBorrowerDeals([]);
        }
    }, [selectedBorrower]);

    function loadDocs() {
        fetch('/api/docvault').then(r => r.json()).then(setDocs);
    }

    async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);

        const payload: any = {
            borrowerId: fd.get('borrowerId'),
            docType: fd.get('docType'),
            category: fd.get('category') || 'general',
            notes: fd.get('notes')
        };
        const dealId = fd.get('dealId');
        if (dealId) payload.dealId = dealId;
        const exp = fd.get('expiresAt') as string;
        if (exp) payload.expiresAt = new Date(exp).toISOString();

        const res = await fetch('/api/docvault', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            setCreateOpen(false);
            setSelectedBorrower('');
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

    const filteredDocs = useMemo(() => {
        let result = docs;
        if (statusFilter !== 'all') {
            result = result.filter(d => d.status === statusFilter);
        }
        if (categoryFilter !== 'all') {
            result = result.filter(d => d.category === categoryFilter);
        }
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(d => {
                const b = borrowers.find(x => x.id === d.borrowerId);
                const bName = b ? `${b.firstName} ${b.lastName}`.toLowerCase() : '';
                return d.docType.toLowerCase().includes(q) || bName.includes(q) || (d.deal?.propertyAddress && d.deal.propertyAddress.toLowerCase().includes(q));
            });
        }
        return result;
    }, [docs, statusFilter, categoryFilter, search, borrowers]);

    const statusColor = (st: string) => st === 'verified' ? s.pillGreen : st === 'uploaded' ? s.pillBlue : st === 'rejected' ? s.pillRed : s.pillYellow;

    return (
        <>
            <div className={s.pageHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>📁 DocVault</h1>
                        <p>Manage document requests, uploads, and tracking per deal</p>
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

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <input className={s.formInput} placeholder="Search borrower or document..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 300 }} />
                <select className={s.formInput} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ width: 150 }}>
                    <option value="all">All Categories</option>
                    <option value="income">Income</option>
                    <option value="identity">Identity</option>
                    <option value="property">Property</option>
                    <option value="legal">Legal</option>
                    <option value="general">General</option>
                </select>
                <select className={s.formInput} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 150 }}>
                    <option value="all">All Statuses</option>
                    <option value="requested">Requested</option>
                    <option value="uploaded">Uploaded</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            <div className={s.card}>
                <table className={s.table}>
                    <thead><tr><th>Document Type</th><th>Borrower & Deal</th><th>Status</th><th>Files</th><th>Actions</th></tr></thead>
                    <tbody>
                        {filteredDocs.map(d => {
                            const borrower = borrowers.find(b => b.id === d.borrowerId);
                            return (
                                <tr key={d.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{d.docType}</div>
                                        <div style={{ fontSize: 11, color: 'var(--bb-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{d.category || 'GENERAL'}</div>
                                        {d.notes && <div style={{ fontSize: 12, color: 'var(--bb-muted)', marginTop: 4 }}>{d.notes}</div>}
                                        {d.expiresAt && <div style={{ fontSize: 12, marginTop: 4, color: new Date(d.expiresAt) < new Date() ? 'var(--bb-danger)' : 'var(--bb-warning)' }}>⏳ Expires: {new Date(d.expiresAt).toLocaleDateString()}</div>}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: 'var(--bb-accent)' }}>{borrower ? `${borrower.firstName} ${borrower.lastName}` : d.borrowerId.slice(-6)}</div>
                                        {d.deal && <div style={{ fontSize: 12, color: 'var(--bb-text-secondary)' }}>{d.deal.propertyAddress || 'Unnamed deal'}</div>}
                                    </td>
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
                                                    <button className={`${s.btn} ${s.btnSmall}`} style={{ background: 'var(--bb-success)', color: '#fff', border: 'none' }} onClick={() => updateStatus(d.id, 'verified')}>Verify</button>
                                                    <button className={`${s.btn} ${s.btnDanger} ${s.btnSmall}`} onClick={() => updateStatus(d.id, 'rejected')}>Reject</button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredDocs.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--bb-muted)' }}>No document requests match your filters.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {createOpen && (
                <div className={s.modal}>
                    <div className={s.modalBackdrop} onClick={() => { setCreateOpen(false); setSelectedBorrower(''); }} />
                    <div className={s.modalContent}>
                        <div className={s.modalHeader}>
                            <div className={s.modalTitle}>New Document Request</div>
                            <button className={s.modalClose} onClick={() => { setCreateOpen(false); setSelectedBorrower(''); }}>✕</button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Borrower</label>
                                <select name="borrowerId" className={s.formInput} value={selectedBorrower} onChange={e => setSelectedBorrower(e.target.value)} required>
                                    <option value="">Select Borrower...</option>
                                    {borrowers.map(b => <option key={b.id} value={b.id}>{b.firstName} {b.lastName}</option>)}
                                </select>
                            </div>
                            {borrowerDeals.length > 0 && (
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Associate with Deal (Optional)</label>
                                    <select name="dealId" className={s.formInput}>
                                        <option value="">No Deal Association</option>
                                        {borrowerDeals.map(d => <option key={d.id} value={d.id}>{d.propertyAddress || 'Unnamed deal'} (${(d.loanAmount / 1000).toFixed(0)}k)</option>)}
                                    </select>
                                </div>
                            )}
                            <div className={s.grid2}>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Category</label>
                                    <select name="category" className={s.formInput}>
                                        <option value="income">Income</option>
                                        <option value="identity">Identity</option>
                                        <option value="property">Property</option>
                                        <option value="legal">Legal</option>
                                        <option value="general">General</option>
                                    </select>
                                </div>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Document Type</label>
                                    <select name="docType" className={s.formInput} required>
                                        {['T4 Slips', 'Notice of Assessment', 'Pay Stubs', 'Letter of Employment', 'Bank Statements', 'Photo ID', 'Proof of Down Payment', 'MLS Listing', 'Property Appraisal', 'Mortgage Statement', 'Property Tax Bill', 'Insurance Certificate', 'Purchase Agreement'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className={s.grid2}>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Request Notes</label>
                                    <input name="notes" placeholder="e.g. Please provide last 30 days..." className={s.formInput} />
                                </div>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Expiry Date (Optional)</label>
                                    <input type="date" name="expiresAt" className={s.formInput} />
                                </div>
                            </div>
                            <div className={s.modalActions} style={{ marginTop: 24 }}>
                                <button type="button" className={`${s.btn} ${s.btnSecondary}`} onClick={() => { setCreateOpen(false); setSelectedBorrower(''); }}>Cancel</button>
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
