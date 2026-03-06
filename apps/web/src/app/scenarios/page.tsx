'use client';
import { useState, useEffect } from 'react';
import s from '@/styles/shared.module.css';

interface Borrower { id: string; firstName: string; lastName: string; }
interface Scenario { id: string; name: string; type: string; inputs: Record<string, number>; results: Record<string, number>; createdAt: string; }

const TEMPLATES: Record<string, Record<string, number>> = {
    purchase: { propertyValue: 500000, downPayment: 100000, interestRate: 5.5, amortYears: 25, annualIncome: 100000, monthlyDebts: 500, propertyTax: 300, heating: 150 },
    refi: { propertyValue: 600000, currentBalance: 350000, interestRate: 5.0, amortYears: 25, annualIncome: 110000, monthlyDebts: 600, propertyTax: 350, heating: 160 },
    renewal: { propertyValue: 550000, currentBalance: 300000, interestRate: 4.8, amortYears: 20, annualIncome: 105000, monthlyDebts: 400, propertyTax: 320, heating: 140 },
    debtConsolidation: { propertyValue: 450000, currentBalance: 200000, additionalDebt: 50000, interestRate: 6.0, amortYears: 25, annualIncome: 85000, monthlyDebts: 800, propertyTax: 280, heating: 130 },
};

function compute(type: string, inputs: Record<string, number>) {
    const pv = inputs.propertyValue || 0;
    const loan = type === 'purchase' ? pv - (inputs.downPayment || 0) : (inputs.currentBalance || 0) + (inputs.additionalDebt || 0);
    const rate = (inputs.interestRate || 5.5) / 100 / 12;
    const n = (inputs.amortYears || 25) * 12;
    const payment = rate > 0 ? (loan * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1) : loan / n;
    const ltv = pv > 0 ? (loan / pv) * 100 : 0;
    const monthlyIncome = (inputs.annualIncome || 0) / 12;
    const pith = payment + (inputs.propertyTax || 0) + (inputs.heating || 0);
    const gds = monthlyIncome > 0 ? (pith / monthlyIncome) * 100 : 0;
    const tds = monthlyIncome > 0 ? ((pith + (inputs.monthlyDebts || 0)) / monthlyIncome) * 100 : 0;
    const stressRate = ((inputs.interestRate || 5.5) + 2) / 100 / 12;
    const stressPayment = stressRate > 0 ? (loan * stressRate * Math.pow(1 + stressRate, n)) / (Math.pow(1 + stressRate, n) - 1) : payment;
    const stressPith = stressPayment + (inputs.propertyTax || 0) + (inputs.heating || 0);
    const stressGDS = monthlyIncome > 0 ? (stressPith / monthlyIncome) * 100 : 0;
    const stressTDS = monthlyIncome > 0 ? ((stressPith + (inputs.monthlyDebts || 0)) / monthlyIncome) * 100 : 0;

    return { loanAmount: Math.round(loan), monthlyPayment: Math.round(payment), ltv: +ltv.toFixed(1), gds: +gds.toFixed(1), tds: +tds.toFixed(1), stressGDS: +stressGDS.toFixed(1), stressTDS: +stressTDS.toFixed(1), gdsPass: gds <= 39, tdsPass: tds <= 44, stressPass: stressGDS <= 39 && stressTDS <= 44 };
}

export default function ScenarioBuilderPage() {
    const [borrowers, setBorrowers] = useState<Borrower[]>([]);
    const [selectedBorrower, setSelectedBorrower] = useState('');
    const [type, setType] = useState('purchase');
    const [inputs, setInputs] = useState(TEMPLATES.purchase);
    const [results, setResults] = useState<ReturnType<typeof compute> | null>(null);
    const [saved, setSaved] = useState<Scenario[]>([]);
    const [toast, setToast] = useState('');
    const [comparing, setComparing] = useState<string[]>([]);

    useEffect(() => { fetch('/api/borrowers').then(r => r.json()).then(setBorrowers); }, []);

    useEffect(() => {
        if (selectedBorrower) fetch(`/api/scenarios?borrowerId=${selectedBorrower}`).then(r => r.json()).then(setSaved);
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
        const res = await fetch('/api/scenarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ borrowerId: selectedBorrower, name: `${type} scenario`, type, inputs, results }),
        });
        if (res.ok) {
            setToast('Scenario saved!');
            setTimeout(() => setToast(''), 3000);
            fetch(`/api/scenarios?borrowerId=${selectedBorrower}`).then(r => r.json()).then(setSaved);
        }
    }

    function toggleCompare(id: string) {
        setComparing(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(-3));
    }

    const compareScenarios = saved.filter(sc => comparing.includes(sc.id));

    return (
        <>
            <div className={s.pageHeader}>
                <h1>🧮 Scenario Builder</h1>
                <p>Model different mortgage scenarios and compare outcomes</p>
            </div>

            <div className={s.grid2}>
                {/* Input Panel */}
                <div className={s.card}>
                    <div className={s.cardTitle}>Build Scenario</div>
                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Borrower</label>
                        <select className={s.formInput} value={selectedBorrower} onChange={e => setSelectedBorrower(e.target.value)}>
                            <option value="">Select...</option>
                            {borrowers.map(b => <option key={b.id} value={b.id}>{b.firstName} {b.lastName}</option>)}
                        </select>
                    </div>
                    <div className={s.tabs}>
                        {Object.keys(TEMPLATES).map(t => (
                            <button key={t} className={`${s.tab} ${type === t ? s.tabActive : ''}`} onClick={() => handleTypeChange(t)}>
                                {t === 'debtConsolidation' ? 'Debt Consol.' : t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>
                    {Object.entries(inputs).map(([key, val]) => (
                        <div className={s.formGroup} key={key}>
                            <label className={s.formLabel}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</label>
                            <input type="number" className={s.formInput} value={val} onChange={e => setInputs({ ...inputs, [key]: Number(e.target.value) })} />
                        </div>
                    ))}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className={`${s.btn} ${s.btnPrimary}`} onClick={handleCalculate}>Calculate</button>
                        {results && selectedBorrower && <button className={`${s.btn} ${s.btnSecondary}`} onClick={handleSave}>Save Scenario</button>}
                    </div>
                </div>

                {/* Results Panel */}
                <div>
                    {results && (
                        <div className={s.card} style={{ marginBottom: 16 }}>
                            <div className={s.cardTitle}>Results</div>
                            <div className={s.kpiRow} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                <div className={s.kpiCard}><div className={s.kpiLabel}>Loan Amount</div><div className={s.kpiValue}>${results.loanAmount.toLocaleString()}</div></div>
                                <div className={s.kpiCard}><div className={s.kpiLabel}>Monthly Payment</div><div className={s.kpiValue}>${results.monthlyPayment.toLocaleString()}</div></div>
                                <div className={s.kpiCard}><div className={s.kpiLabel}>LTV</div><div className={s.kpiValue}>{results.ltv}%</div></div>
                                <div className={s.kpiCard}><div className={s.kpiLabel}>GDS</div><div className={s.kpiValue} style={{ color: results.gdsPass ? 'var(--bb-success)' : 'var(--bb-danger)' }}>{results.gds}%</div></div>
                                <div className={s.kpiCard}><div className={s.kpiLabel}>TDS</div><div className={s.kpiValue} style={{ color: results.tdsPass ? 'var(--bb-success)' : 'var(--bb-danger)' }}>{results.tds}%</div></div>
                                <div className={s.kpiCard}><div className={s.kpiLabel}>Stress Test</div><div className={s.kpiValue} style={{ color: results.stressPass ? 'var(--bb-success)' : 'var(--bb-danger)' }}>{results.stressPass ? 'PASS' : 'FAIL'}</div></div>
                            </div>
                        </div>
                    )}

                    {/* Saved Scenarios */}
                    {saved.length > 0 && (
                        <div className={s.card}>
                            <div className={s.cardTitle}>Saved Scenarios</div>
                            <table className={s.table}>
                                <thead><tr><th>Compare</th><th>Name</th><th>Type</th><th>Loan</th><th>Payment</th><th>Created</th></tr></thead>
                                <tbody>
                                    {saved.map(sc => {
                                        const r = sc.results as Record<string, number>;
                                        return (
                                            <tr key={sc.id}>
                                                <td><input type="checkbox" checked={comparing.includes(sc.id)} onChange={() => toggleCompare(sc.id)} /></td>
                                                <td>{sc.name}</td>
                                                <td><span className={`${s.pill} ${s.pillBlue}`}>{sc.type}</span></td>
                                                <td>${(r.loanAmount || 0).toLocaleString()}</td>
                                                <td>${(r.monthlyPayment || 0).toLocaleString()}</td>
                                                <td style={{ fontSize: 12, color: 'var(--bb-muted)' }}>{new Date(sc.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Comparison */}
            {compareScenarios.length >= 2 && (
                <div className={s.card} style={{ marginTop: 24 }}>
                    <div className={s.cardTitle}>Scenario Comparison</div>
                    <table className={s.table}>
                        <thead>
                            <tr><th>Metric</th>{compareScenarios.map(sc => <th key={sc.id}>{sc.name}</th>)}</tr>
                        </thead>
                        <tbody>
                            {['loanAmount', 'monthlyPayment', 'ltv', 'gds', 'tds'].map(metric => (
                                <tr key={metric}>
                                    <td style={{ fontWeight: 600 }}>{metric.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</td>
                                    {compareScenarios.map(sc => {
                                        const r = sc.results as Record<string, number>;
                                        return <td key={sc.id}>{typeof r[metric] === 'number' ? (metric.includes('Amount') || metric.includes('Payment') ? `$${r[metric].toLocaleString()}` : `${r[metric]}%`) : '—'}</td>;
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {toast && <div className={`${s.toast} ${s.toastSuccess}`}>{toast}</div>}
        </>
    );
}
