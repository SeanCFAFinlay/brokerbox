'use client';
import { useState, useEffect } from 'react';
import s from '@/styles/shared.module.css';

interface Borrower { id: string; firstName: string; lastName: string; }
interface MatchResult {
    lenderId: string; lenderName: string; score: number; passed: boolean;
    failures: string[];
    breakdown: { factor: string; score: number; weight: number; weighted: number }[];
    requiredDocs: string[];
    effectiveRate: number;
}

export default function MatchPage() {
    const [borrowers, setBorrowers] = useState<Borrower[]>([]);
    const [selectedBorrower, setSelectedBorrower] = useState('');
    const [results, setResults] = useState<MatchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/borrowers').then(r => r.json()).then(data => setBorrowers(Array.isArray(data) ? data : []));
    }, []);

    async function runMatch() {
        if (!selectedBorrower) return;
        setLoading(true);
        const res = await fetch('/api/match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ borrowerId: selectedBorrower }),
        });
        const data = await res.json();
        setResults(data.results || []);
        setLoading(false);
    }

    return (
        <>
            <div className={s.pageHeader}>
                <h1>🎯 BrokerBox Match</h1>
                <p>Find the best lender for your borrower using rules + scoring</p>
            </div>

            <div className={s.card} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                    <div className={s.formGroup} style={{ flex: 1, marginBottom: 0 }}>
                        <label className={s.formLabel}>Select Borrower</label>
                        <select className={s.formInput} value={selectedBorrower} onChange={e => setSelectedBorrower(e.target.value)}>
                            <option value="">Choose a borrower...</option>
                            {borrowers.map(b => <option key={b.id} value={b.id}>{b.firstName} {b.lastName}</option>)}
                        </select>
                    </div>
                    <button className={`${s.btn} ${s.btnPrimary}`} onClick={runMatch} disabled={!selectedBorrower || loading}>
                        {loading ? 'Matching...' : 'Run Match Engine'}
                    </button>
                </div>
            </div>

            {results.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {results.map((r, i) => (
                        <div key={r.lenderId} className={s.matchCard} style={{ opacity: r.passed ? 1 : 0.6, flexDirection: 'column', alignItems: 'stretch' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--bb-muted)', width: 30 }}>#{i + 1}</div>
                                <div className={`${s.scoreCircle} ${r.score >= 70 ? s.scoreHigh : r.score >= 40 ? s.scoreMed : s.scoreLow}`}>
                                    {r.score}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--bb-text)' }}>{r.lenderName}</div>
                                    <div style={{ fontSize: 13, color: 'var(--bb-text-secondary)' }}>
                                        Rate: {r.effectiveRate.toFixed(2)}% · {r.passed ? <span style={{ color: 'var(--bb-success)' }}>✓ All gates passed</span> : <span style={{ color: 'var(--bb-danger)' }}>✗ {r.failures.length} gate failure(s)</span>}
                                    </div>
                                </div>
                                <button className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`} onClick={() => setExpanded(expanded === r.lenderId ? null : r.lenderId)}>
                                    {expanded === r.lenderId ? 'Hide Details' : 'View Details'}
                                </button>
                            </div>

                            {expanded === r.lenderId && (
                                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--bb-border)' }}>
                                    {r.failures.length > 0 && (
                                        <div style={{ marginBottom: 12 }}>
                                            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--bb-danger)', marginBottom: 6 }}>Gate Failures:</div>
                                            {r.failures.map((f, fi) => <div key={fi} style={{ fontSize: 13, color: 'var(--bb-text-secondary)', paddingLeft: 8 }}>• {f}</div>)}
                                        </div>
                                    )}
                                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: 'var(--bb-text)' }}>Score Breakdown:</div>
                                    <table className={s.table}>
                                        <thead><tr><th>Factor</th><th>Score</th><th>Weight</th><th>Weighted</th></tr></thead>
                                        <tbody>
                                            {r.breakdown.map(b => (
                                                <tr key={b.factor}>
                                                    <td>{b.factor}</td>
                                                    <td>{b.score}</td>
                                                    <td>{(b.weight * 100).toFixed(0)}%</td>
                                                    <td>{b.weighted.toFixed(1)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {r.requiredDocs.length > 0 && (
                                        <div style={{ marginTop: 12 }}>
                                            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: 'var(--bb-text)' }}>Required Documents:</div>
                                            {r.requiredDocs.map((d, di) => <span key={di} className={`${s.pill} ${s.pillBlue}`} style={{ marginRight: 6, marginBottom: 4 }}>{d}</span>)}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {results.length === 0 && !loading && selectedBorrower && (
                <div className={s.emptyState}>
                    <div className={s.emptyIcon}>🎯</div>
                    <p>Select a borrower and run the match engine to see results.</p>
                </div>
            )}
        </>
    );
}
