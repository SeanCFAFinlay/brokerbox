'use client';
import { useState } from 'react';
import s from '@/styles/shared.module.css';

export default function CalculatorsPage() {
    const [tab, setTab] = useState('payment');

    // Payment Calc State
    const [loanAmt, setLoanAmt] = useState(500000);
    const [rate, setRate] = useState(5.5);
    const [amort, setAmort] = useState(25);

    // Affordability Calc State
    const [income, setIncome] = useState(120000);
    const [debts, setDebts] = useState(500);
    const [downPayment, setDownPayment] = useState(100000);
    const [qualRate, setQualRate] = useState(7.5);

    // Bridge Calc State
    const [purchasePrice, setPurchasePrice] = useState(800000);
    const [deposit, setDeposit] = useState(40000);
    const [salePrice, setSalePrice] = useState(600000);
    const [currentMortgage, setCurrentMortgage] = useState(300000);
    const [bridgeTerm, setBridgeTerm] = useState(60); // days
    const [bridgeRate, setBridgeRate] = useState(10.0);

    // Results
    const payment = rate > 0 ? (loanAmt * (rate / 100 / 12) * Math.pow(1 + (rate / 100 / 12), amort * 12)) / (Math.pow(1 + (rate / 100 / 12), amort * 12) - 1) : loanAmt / (amort * 12);

    // Max Affordability (based on 39% GDS)
    const monthlyIncome = income / 12;
    const maxPith = monthlyIncome * 0.39;
    const maxTdsPith = (monthlyIncome * 0.44) - debts;
    const allowedPayment = Math.min(maxPith, maxTdsPith) - 400; // rough tax+heat buffer
    const qRate = qualRate / 100 / 12;
    const maxLoan = allowedPayment > 0 ? allowedPayment * ((Math.pow(1 + qRate, 25 * 12) - 1) / (qRate * Math.pow(1 + qRate, 25 * 12))) : 0;
    const maxPurchase = maxLoan + downPayment;

    // Bridge Loan
    const bridgeAmount = purchasePrice - deposit;
    const netProceeds = salePrice - currentMortgage; // rough
    const bridgeInterest = (bridgeAmount * (bridgeRate / 100)) * (bridgeTerm / 365);

    return (
        <>
            <div className={s.pageHeader}>
                <h1>🔢 Calculator Suite</h1>
                <p>Quick financial tools for immediate borrower estimates</p>
            </div>

            <div className={s.tabs} style={{ marginBottom: 24 }}>
                <button className={`${s.tab} ${tab === 'payment' ? s.tabActive : ''}`} onClick={() => setTab('payment')}>Mortgage Payment</button>
                <button className={`${s.tab} ${tab === 'affordability' ? s.tabActive : ''}`} onClick={() => setTab('affordability')}>Max Affordability</button>
                <button className={`${s.tab} ${tab === 'bridge' ? s.tabActive : ''}`} onClick={() => setTab('bridge')}>Bridge Loan Option</button>
            </div>

            <div className={s.grid2}>
                <div className={s.card}>
                    <div className={s.cardTitle}>Calculator Inputs</div>

                    {tab === 'payment' && (
                        <>
                            <div className={s.formGroup}><label className={s.formLabel}>Loan Amount ($)</label><input type="number" className={s.formInput} value={loanAmt} onChange={e => setLoanAmt(Number(e.target.value))} /></div>
                            <div className={s.formGroup}><label className={s.formLabel}>Interest Rate (%)</label><input type="number" step="0.01" className={s.formInput} value={rate} onChange={e => setRate(Number(e.target.value))} /></div>
                            <div className={s.formGroup}><label className={s.formLabel}>Amortization (Years)</label><input type="number" className={s.formInput} value={amort} onChange={e => setAmort(Number(e.target.value))} /></div>
                        </>
                    )}

                    {tab === 'affordability' && (
                        <>
                            <div className={s.formGroup}><label className={s.formLabel}>Annual Household Income ($)</label><input type="number" className={s.formInput} value={income} onChange={e => setIncome(Number(e.target.value))} /></div>
                            <div className={s.formGroup}><label className={s.formLabel}>Monthly Debts ($)</label><input type="number" className={s.formInput} value={debts} onChange={e => setDebts(Number(e.target.value))} /></div>
                            <div className={s.formGroup}><label className={s.formLabel}>Available Down Payment ($)</label><input type="number" className={s.formInput} value={downPayment} onChange={e => setDownPayment(Number(e.target.value))} /></div>
                            <div className={s.formGroup}><label className={s.formLabel}>Qualifying Rate (%)</label><input type="number" step="0.01" className={s.formInput} value={qualRate} onChange={e => setQualRate(Number(e.target.value))} /></div>
                        </>
                    )}

                    {tab === 'bridge' && (
                        <>
                            <div className={s.formGroup}><label className={s.formLabel}>New Purchase Price ($)</label><input type="number" className={s.formInput} value={purchasePrice} onChange={e => setPurchasePrice(Number(e.target.value))} /></div>
                            <div className={s.formGroup}><label className={s.formLabel}>Already Paid Deposit ($)</label><input type="number" className={s.formInput} value={deposit} onChange={e => setDeposit(Number(e.target.value))} /></div>
                            <div className={s.formGroup}><label className={s.formLabel}>Current Home Sale Price ($)</label><input type="number" className={s.formInput} value={salePrice} onChange={e => setSalePrice(Number(e.target.value))} /></div>
                            <div className={s.formGroup}><label className={s.formLabel}>Current Mortgage Balance ($)</label><input type="number" className={s.formInput} value={currentMortgage} onChange={e => setCurrentMortgage(Number(e.target.value))} /></div>
                            <div className={s.formGroup}><label className={s.formLabel}>Bridge Duration (Days)</label><input type="number" className={s.formInput} value={bridgeTerm} onChange={e => setBridgeTerm(Number(e.target.value))} /></div>
                            <div className={s.formGroup}><label className={s.formLabel}>Bridge Interest Rate (%)</label><input type="number" step="0.1" className={s.formInput} value={bridgeRate} onChange={e => setBridgeRate(Number(e.target.value))} /></div>
                        </>
                    )}
                </div>

                <div className={s.card}>
                    <div className={s.cardTitle}>Instant Results</div>

                    {tab === 'payment' && (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div style={{ fontSize: 13, color: 'var(--bb-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Monthly Payment</div>
                            <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--bb-accent)' }}>${Math.round(payment).toLocaleString()}</div>
                            <div style={{ fontSize: 14, color: 'var(--bb-text-secondary)', marginTop: 16 }}>Based on ${loanAmt.toLocaleString()} at {rate}% over {amort} years</div>
                        </div>
                    )}

                    {tab === 'affordability' && (
                        <div style={{ padding: '20px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--bb-border)', marginBottom: 16 }}>
                                <span style={{ fontSize: 16, color: 'var(--bb-muted)' }}>Est. Max Loan Size</span>
                                <span style={{ fontSize: 18, fontWeight: 600 }}>${Math.round(maxLoan).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--bb-border)', marginBottom: 16 }}>
                                <span style={{ fontSize: 16, color: 'var(--bb-muted)' }}>Available Down Payment</span>
                                <span style={{ fontSize: 18, fontWeight: 600 }}>${Math.round(downPayment).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
                                <span style={{ fontSize: 18, color: 'var(--bb-muted)' }}>Max Purchase Price</span>
                                <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--bb-success)' }}>${Math.round(maxPurchase).toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                    {tab === 'bridge' && (
                        <div style={{ padding: '20px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--bb-border)', marginBottom: 12 }}>
                                <span style={{ fontSize: 15, color: 'var(--bb-muted)' }}>Required Bridge Amount</span>
                                <span style={{ fontSize: 16, fontWeight: 600 }}>${Math.round(bridgeAmount).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--bb-border)', marginBottom: 12 }}>
                                <span style={{ fontSize: 15, color: 'var(--bb-muted)' }}>Net Proceeds from Sale</span>
                                <span style={{ fontSize: 16, fontWeight: 600 }}>${Math.round(netProceeds).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--bb-border)', marginBottom: 12 }}>
                                <span style={{ fontSize: 15, color: 'var(--bb-muted)' }}>Estimated Interest Cost</span>
                                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--bb-danger)' }}>${Math.round(bridgeInterest).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
                                <span style={{ fontSize: 16, color: 'var(--bb-muted)' }}>Residual for New Closing</span>
                                <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--bb-success)' }}>${Math.round(netProceeds - bridgeAmount - bridgeInterest).toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
