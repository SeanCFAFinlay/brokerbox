'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import s from '@/styles/shared.module.css';

interface Borrower {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    province: string;
    creditScore: number;
    income: number;
    employmentStatus: string;
    borrowerType: string;
    status: string;
    _count: { deals: number };
}

export default function BorrowerTable({ borrowers }: { borrowers: Borrower[] }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [provinceFilter, setProvinceFilter] = useState('all');
    const [sortField, setSortField] = useState<'name' | 'creditScore' | 'income' | 'deals'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const provinces = useMemo(() => [...new Set(borrowers.map(b => b.province))].sort(), [borrowers]);

    const filtered = useMemo(() => {
        let result = borrowers;

        if (search) {
            const q = search.toLowerCase();
            result = result.filter(b =>
                `${b.firstName} ${b.lastName}`.toLowerCase().includes(q) ||
                b.email.toLowerCase().includes(q) ||
                (b.phone && b.phone.includes(q))
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(b => b.status === statusFilter);
        }

        if (provinceFilter !== 'all') {
            result = result.filter(b => b.province === provinceFilter);
        }

        result = [...result].sort((a, b) => {
            let cmp = 0;
            switch (sortField) {
                case 'name': cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`); break;
                case 'creditScore': cmp = a.creditScore - b.creditScore; break;
                case 'income': cmp = a.income - b.income; break;
                case 'deals': cmp = a._count.deals - b._count.deals; break;
            }
            return sortDir === 'desc' ? -cmp : cmp;
        });

        return result;
    }, [borrowers, search, statusFilter, provinceFilter, sortField, sortDir]);

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
                    placeholder="Search borrowers..."
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
                <select className={s.formInput} value={provinceFilter} onChange={e => setProvinceFilter(e.target.value)} style={{ width: 120 }}>
                    <option value="all">All Provinces</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            <div className={s.card}>
                <table className={s.table}>
                    <thead>
                        <tr>
                            <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('name')}>Name{sortArrow('name')}</th>
                            <th>Email</th>
                            <th>Province</th>
                            <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('creditScore')}>Credit Score{sortArrow('creditScore')}</th>
                            <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('income')}>Income{sortArrow('income')}</th>
                            <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('deals')}>Deals{sortArrow('deals')}</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(b => (
                            <tr key={b.id}>
                                <td><Link href={`/borrowers/${b.id}`} style={{ color: 'var(--bb-accent)', fontWeight: 600 }}>{b.firstName} {b.lastName}</Link></td>
                                <td>{b.email}</td>
                                <td>{b.province}</td>
                                <td>{b.creditScore}</td>
                                <td>${b.income.toLocaleString()}</td>
                                <td>{b._count.deals}</td>
                                <td><span className={`${s.pill} ${b.status === 'active' ? s.pillGreen : s.pillGray}`}>{b.status}</span></td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--bb-muted)', padding: 24 }}>No borrowers match your filters.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
