'use client';
import { useState, useEffect } from 'react';
import s from '@/styles/shared.module.css';

interface Borrower { id: string; firstName: string; lastName: string; }
interface Deal { id: string; propertyAddress: string; loanAmount: number; stage: string; }
interface Scenario {
    id: string;
    name: string;
    type: string;
    status: string;
    inputs: Record<string, number>;
    results: Record<string, number>;
    isPreferred: boolean;
    recommendationNotes: string;
    exitCost?: number;
    createdAt: string;
    deal?: { propertyAddress: string };
}

const TEMPLATES: Record<string, Record<string, number>> = {
    purchase: { propertyValue: 500000, downPayment: 100000, interestRate: 5.5, amortYears: 25, annualIncome: 100000, monthlyDebts: 500, propertyTax: 300, heating: 150 },
    refi: { propertyValue: 600000, currentBalance: 350000, interestRate: 5.0, amortYears: 25, annualIncome: 110000, monthlyDebts: 600, propertyTax: 350, heating: 160 },
    bridge: { propertyValue: 800000, loanAmount: 600000, interestRate: 8.5, termMonths: 6, lenderFee: 2, brokerFee: 1, exitCost: 500 },
    construction: { propertyValue: 1200000, costToBuild: 800000, interestRate: 9.0, termMonths: 18, lenderFee: 3, brokerFee: 1.5 },
};

function compute(type: string, inputs: Record<string, number>) {
    const pv = inputs.propertyValue || 0;
    let loan = 0;
    let payment = 0;
    let isInterestOnly = false;

    if (type === 'purchase') {
        loan = pv - (inputs.downPayment || 0);
    } else if (type === 'bridge' || type === 'construction') {
        loan = inputs.loanAmount || (type === 'construction' ? (inputs.costToBuild || 0) * 0.75 : 0);
        isInterestOnly = true;
    } else {
        loan = (inputs.currentBalance || 0) + (inputs.additionalDebt || 0);
    }

    const rate = (inputs.interestRate || 5.5) / 100 / 12;

    if (isInterestOnly) {
        payment = loan * rate;
    } else {
        const n = (inputs.amortYears || 25) * 12;
        payment = rate > 0 ? (loan * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1) : loan / n;
    }

    const ltv = pv > 0 ? (loan / pv) * 100 : 0;
    const monthlyIncome = (inputs.annualIncome || 0) / 12;
    const pih = payment + (inputs.propertyTax || 0) + (inputs.heating || 0);

    // GDS/TDS only for residential non-bridge/construction for now
    const gds = monthlyIncome > 0 ? (pih / monthlyIncome) * 100 : 0;
    const tds = monthlyIncome > 0 ? ((pih + (inputs.monthlyDebts || 0)) / monthlyIncome) * 100 : 0;

    return {
        loanAmount: Math.round(loan),
        monthlyPayment: Math.round(payment),
        ltv: +ltv.toFixed(1),
        gds: +gds.toFixed(1),
        tds: +tds.toFixed(1),
        isInterestOnly,
        exitCost: inputs.exitCost || 0
    };
}

export default function ScenarioBuilderPage() {
    const [borrowers, setBorrowers] = useState<Borrower[]>([]);
    const [selectedBorrower, setSelectedBorrower] = useState('');
    const [borrowerDeals, setBorrowerDeals] = useState<Deal[]>([]);
    const [selectedDeal, setSelectedDeal] = useState('');

    const [type, setType] = useState('purchase');
    const [status, setStatus] = useState('WORKING');
    const [inputs, setInputs] = useState(TEMPLATES.purchase);
    const [results, setResults] = useState<ReturnType<typeof compute> | null>(null);
    const [saved, setSaved] = useState<Scenario[]>([]);
    const [toast, setToast] = useState('');
    const [comparing, setComparing] = useState<string[]>([]);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editNoteText, setEditNoteText] = useState('');
    const [matchData, setMatchData] = useState<any[]>([]);

    useEffect(() => { fetch('/api/borrowers').then(r => r.json()).then(setBorrowers); }, []);

    useEffect(() => {
        if (selectedBorrower) {
            fetch(`/api/scenarios?borrowerId=${selectedBorrower}`).then(r => r.json()).then(setSaved);
            fetch(`/api/borrowers/${selectedBorrower}`).then(r => r.json()).then(data => {
                setBorrowerDeals(data.deals || []);
                setSelectedDeal('');
            });
        }
    }, [selectedBorrower]);

    function handleTypeChange(t: string) {
        setType(t);
        setInputs(TEMPLATES[t]);
        setResults(null);
    }

    function handleCalculate() {
        setResults(compute(type, inputs));
    }

    async function handleSave() {
        if (!selectedBorrower || !results) return;
        const payload: any = {
            borrowerId: selectedBorrower,
            name: `${type.toUpperCase()} - ${new Date().toLocaleDateString()}`,
            type,
            status,
            inputs,
            results,
            exitCost: results.exitCost
        };
        if (selectedDeal) payload.dealId = selectedDeal;

        const res = await fetch('/api/scenarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (res.ok) {
            setToast('Scenario saved successfully!');
            setTimeout(() => setToast(''), 3000);
            fetch(`/api/scenarios?borrowerId=${selectedBorrower}`).then(r => r.json()).then(setSaved);
        }
    }

    async function updateStatus(id: string, newStatus: string) {
        const res = await fetch(`/api/scenarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
            setSaved(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
        }
    }

    async function togglePreferred(id: string, currentVal: boolean) {
        const res = await fetch(`/api/scenarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPreferred: !currentVal }),
        });
        if (res.ok) {
            setSaved(prev => prev.map(s => s.id === id ? { ...s, isPreferred: !currentVal } : s));
        }
    }

    async function saveNote(id: string) {
        const res = await fetch(`/api/scenarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recommendationNotes: editNoteText }),
        });
        if (res.ok) {
            setSaved(prev => prev.map(s => s.id === id ? { ...s, recommendationNotes: editNoteText } : s));
            setEditingNoteId(null);
        }
    }

    function toggleCompare(id: string) {
        setComparing(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(-3));
    }

    const compareScenarios = saved.filter(sc => comparing.includes(sc.id));

    return (
        <>
            <div className={s.pageHeader}>
                <h1>🧮 Scenario Builder 2.0</h1>
                <p>Model complex structures including Bridge and Construction loans with full lifecycle tracking.</p>
            </div>

            <div className={s.grid2}>
                <div className={s.card}>
                    <div className={s.cardTitle}>Structure Inputs</div>
                    <div className={s.grid2} style={{ gap: 16 }}>
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Borrower</label>
                            <select className={s.formInput} value={selectedBorrower} onChange={e => setSelectedBorrower(e.target.value)}>
                                <option value="">Select Borrower...</option>
                                {borrowers.map(b => <option key={b.id} value={b.id}>{b.firstName} {b.lastName}</option>)}
                            </select>
                        </div>
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Status</label>
                            <select className={s.formInput} value={status} onChange={e => setStatus(e.target.value)}>
                                <option value="WORKING">Working</option>
                                <option value="RECOMMENDED">Recommended</option>
                                <option value="SUBMITTED">Submitted</option>
                            </select>
                        </div>
                    </div>

                    <div className={s.tabs} style={{ marginTop: 16 }}>
                        {Object.keys(TEMPLATES).map(t => (
                            <button key={t} className={`${s.tab} ${type === t ? s.tabActive : ''}`} onClick={() => handleTypeChange(t)}>
                                {t.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                        {Object.entries(inputs).map(([key, val]) => (
                            <div className={s.formGroup} key={key}>
                                <label className={s.formLabel} style={{ fontSize: 11 }}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</label>
                                <input type="number" className={s.formInput} value={val} onChange={e => setInputs({ ...inputs, [key]: Number(e.target.value) })} />
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                        <button className={`${s.btn} ${s.btnPrimary}`} onClick={handleCalculate} style={{ flex: 1 }}>Calculate</button>
                        {results && selectedBorrower && <button className={`${s.btn} ${s.btnSecondary}`} onClick={handleSave} style={{ flex: 1 }}>Save Scenario</button>}
                    </div>
                </div>

                <div>
                    {results && (
                        <div className={s.card} style={{ marginBottom: 16, borderLeft: '4px solid var(--bb-accent)' }}>
                            <div className={s.cardTitle}>Projected Outcomes</div>
                            <div className={s.kpiRow} style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                                <div className={s.kpiCard}><div className={s.kpiLabel}>Loan Amount</div><div className={s.kpiValue}>${results.loanAmount.toLocaleString()}</div></div>
                                <div className={s.kpiCard}><div className={s.kpiLabel}>Monthly {results.isInterestOnly ? '(I/O)' : ''}</div><div className={s.kpiValue}>${results.monthlyPayment.toLocaleString()}</div></div>
                                <div className={s.kpiCard}><div className={s.kpiLabel}>LTV</div><div className={s.kpiValue}>{results.ltv}%</div></div>
                                {type === 'purchase' || type === 'refi' ? (
                                    <>
                                        <div className={s.kpiCard}><div className={s.kpiLabel}>GDS</div><div className={s.kpiValue}>{results.gds}%</div></div>
                                        <div className={s.kpiCard}><div className={s.kpiLabel}>TDS</div><div className={s.kpiValue}>{results.tds}%</div></div>
                                    </>
                                ) : (
                                    <div className={s.kpiCard}><div className={s.kpiLabel}>Exit Cost</div><div className={s.kpiValue}>${(results.exitCost || 0).toLocaleString()}</div></div>
                                )}
                            </div>

                            <button
                                className={`${s.btn} ${s.btnSecondary}`}
                                style={{ marginTop: 16, width: '100%', background: 'var(--bb-surface-2)' }}
                                onClick={async () => {
                                    const res = await fetch('/api/match', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ borrowerId: selectedBorrower, dealId: selectedDeal || undefined })
                                    });
                                    if (res.ok) {
                                        const data = await res.json();
                                        setMatchData(data.results.slice(0, 3));
                                    }
                                }}
                            >
                                🔍 Find Matched Lenders for this Structure
                            </button>

                            {matchData.length > 0 && (
                                <div style={{ marginTop: 16, borderTop: '1px solid var(--bb-border)', paddingTop: 16 }}>
                                    {matchData.map(m => (
                                        <div key={m.lenderId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: 'var(--bb-bg)', borderRadius: 8, marginBottom: 8 }}>
                                            <div className={s.scoreCircle} style={{ width: 32, height: 32 }}>{m.score}</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: 13 }}>{m.lenderName}</div>
                                                <div style={{ color: 'var(--bb-muted)', fontSize: 11 }}>{m.effectiveRate.toFixed(2)}% · {m.passed ? 'Policy Pass' : 'Exception Req.'}</div>
                                            </div>
                                            <button className={`${s.btn} ${s.btnSmall} ${s.btnSecondary}`} onClick={() => setInputs(prev => ({ ...prev, interestRate: m.effectiveRate }))}>Apply Rate</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className={s.card}>
                        <div className={s.cardTitle}>Scenario Library</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {saved.map(sc => (
                                <div key={sc.id} style={{ padding: 16, border: '1px solid var(--bb-border)', borderRadius: 10, backgroundColor: sc.isPreferred ? 'rgba(76, 175, 80, 0.05)' : 'transparent' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <input type="checkbox" checked={comparing.includes(sc.id)} onChange={() => toggleCompare(sc.id)} />
                                            <span style={{ fontWeight: 700 }}>{sc.name}</span>
                                            <span className={`${s.pill} ${sc.status === 'WORKING' ? s.pillGray : sc.status === 'RECOMMENDED' ? s.pillBlue : s.pillGreen}`} style={{ fontSize: 10 }}>
                                                {sc.status}
                                            </span>
                                        </div>
                                        <select
                                            value={sc.status}
                                            onChange={(e) => updateStatus(sc.id, e.target.value)}
                                            style={{ fontSize: 11, padding: '2px 4px', borderRadius: 4, background: 'var(--bb-surface-2)', border: '1px solid var(--bb-border)', color: 'var(--bb-text)' }}
                                        >
                                            <option value="WORKING">Working</option>
                                            <option value="RECOMMENDED">Recommended</option>
                                            <option value="SUBMITTED">Submitted</option>
                                        </select>
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--bb-muted)' }}>
                                        Loan: ${(sc.results.loanAmount as number).toLocaleString()} · Pmt: ${(sc.results.monthlyPayment as number).toLocaleString()}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                        <button className={`${s.btn} ${s.btnSmall} ${s.btnSecondary}`} onClick={() => togglePreferred(sc.id, sc.isPreferred)}>
                                            {sc.isPreferred ? 'Unmark Preferred' : '★ Mark Preferred'}
                                        </button>
                                        <button className={`${s.btn} ${s.btnSmall} ${s.btnSecondary}`} onClick={() => { setEditingNoteId(sc.id); setEditNoteText(sc.recommendationNotes || ''); }}>
                                            Notes
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {compareScenarios.length >= 2 && (
                <div className={s.card} style={{ marginTop: 24 }}>
                    <div className={s.cardTitle}>Scenario Comparison</div>
                    <div className={s.tableContainer}>
                        <table className={s.table}>
                            <thead>
                                <tr><th>Metric</th>{compareScenarios.map(sc => <th key={sc.id}>{sc.name} {sc.isPreferred && <span style={{ color: 'var(--bb-success)' }}>★</span>}</th>)}</tr>
                            </thead>
                            <tbody>
                                {['loanAmount', 'monthlyPayment', 'ltv', 'gds', 'tds'].map(metric => (
                                    <tr key={metric}>
                                        <td style={{ fontWeight: 600 }}>{metric.replace(/([A-Z])/g, ' $1').toUpperCase()}</td>
                                        {compareScenarios.map(sc => {
                                            const r = sc.results as Record<string, number>;
                                            return <td key={sc.id}>{typeof r[metric] === 'number' ? (metric.includes('Amount') || metric.includes('Payment') ? `$${r[metric].toLocaleString()}` : `${r[metric]}%`) : '—'}</td>;
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {toast && <div className={`${s.toast} ${s.toastSuccess}`}>{toast}</div>}
        </>
    );
}
