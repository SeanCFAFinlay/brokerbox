'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import s from '@/styles/shared.module.css';

interface Lender {
    id: string;
    name: string;
    contactName: string | null;
    contactEmail: string | null;
    minLoan: number;
    maxLoan: number;
    capitalAvailable: number;
    capitalCommitted: number;
    positionTypes: string[];
    productCategories: string[];
    status: string;
    _count: { deals: number };
}

export default function LenderTable({ lenders }: { lenders: Lender[] }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortField, setSortField] = useState<'name' | 'deals' | 'capital' | 'maxLoan'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const categories = useMemo(() => {
        const cats = new Set<string>();
        lenders.forEach(l => l.productCategories.forEach(c => cats.add(c)));
        return Array.from(cats).sort();
    }, [lenders]);

    const filtered = useMemo(() => {
        let result = lenders;

        if (search) {
            const q = search.toLowerCase();
            result = result.filter(l =>
                l.name.toLowerCase().includes(q) ||
                (l.contactName && l.contactName.toLowerCase().includes(q)) ||
                (l.contactEmail && l.contactEmail.toLowerCase().includes(q))
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(l => l.status === statusFilter);
        }

        if (categoryFilter !== 'all') {
            result = result.filter(l => l.productCategories.includes(categoryFilter));
        }

        result = [...result].sort((a, b) => {
            let cmp = 0;
            switch (sortField) {
                case 'name': cmp = a.name.localeCompare(b.name); break;
                case 'deals': cmp = a._count.deals - b._count.deals; break;
                case 'capital': cmp = a.capitalAvailable - b.capitalAvailable; break;
                case 'maxLoan': cmp = a.maxLoan - b.maxLoan; break;
            }
            return sortDir === 'desc' ? -cmp : cmp;
        });

        return result;
    }, [lenders, search, statusFilter, categoryFilter, sortField, sortDir]);

    function toggleSort(field: typeof sortField) {
        if (sortField === field) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    }

    const sortArrow = (field: typeof sortField) => sortField === field ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

    return (
        <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    className={s.formInput}
                    placeholder="Search lenders..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 200 }}
                />
                <select className={s.formInput} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 140 }}>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                </select>
                <select className={s.formInput} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ width: 160 }}>
                    <option value="all">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div className={s.card}>
                <table className={s.table}>
                    <thead>
                        <tr>
                            <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('name')}>Lender{sortArrow('name')}</th>
                            <th>Categories</th>
                            <th>Positions</th>
                            <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('maxLoan')}>Max Loan{sortArrow('maxLoan')}</th>
                            <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('capital')}>Capital Avail{sortArrow('capital')}</th>
                            <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('deals')}>Deals{sortArrow('deals')}</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(l => (
                            <tr key={l.id}>
                                <td><Link href={`/lenders/${l.id}`} style={{ color: 'var(--bb-accent)', fontWeight: 600 }}>{l.name}</Link></td>
                                <td>
                                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                        {l.productCategories.slice(0, 2).map(c => <span key={c} className={`${s.pill} ${s.pillGray}`} style={{ fontSize: 10 }}>{c}</span>)}
                                        {l.productCategories.length > 2 && <span className={`${s.pill} ${s.pillGray}`} style={{ fontSize: 10 }}>+{l.productCategories.length - 2}</span>}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                        {l.positionTypes.map(p => <span key={p} className={`${s.pill} ${s.pillBlue}`} style={{ fontSize: 10 }}>{p}</span>)}
                                    </div>
                                </td>
                                <td>${(l.maxLoan / 1e6).toFixed(1)}M</td>
                                <td>${(l.capitalAvailable / 1e6).toFixed(1)}M</td>
                                <td>{l._count.deals}</td>
                                <td><span className={`${s.pill} ${l.status === 'active' ? s.pillGreen : s.pillGray}`}>{l.status}</span></td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--bb-muted)', padding: 24 }}>No lenders match your filters.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
