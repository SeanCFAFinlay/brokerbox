import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import s from '@/styles/shared.module.css';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data: loan, error } = await supabase
        .from('Loan')
        .select(`
            *,
            deal:Deal(*, borrower:Borrower(*), lender:Lender(*)),
            payments:LoanPayment(*),
            fees:LoanFee(*)
        `)
        .eq('id', id)
        .single();

    if (error || !loan) return notFound();

    // Manual sort
    if (loan.payments) (loan.payments as any[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (loan.fees) (loan.fees as any[]).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div style={{ padding: '40px' }}>
            <div className={s.pageHeader}>
                <div>
                    <h1>Loan Detail: {loan.deal?.borrower?.firstName} {loan.deal?.borrower?.lastName}</h1>
                    <p>{loan.deal?.propertyAddress}</p>
                </div>
                <Link href="/loans" className={`${s.btn} ${s.btnSecondary}`}>&larr; Back to Loans</Link>
            </div>

            <div className={s.grid2}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className={s.card}>
                        <div className={s.cardTitle}>Financial Overview</div>
                        <div className={s.kpiRow} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            <div className={s.kpiCard}><div className={s.kpiLabel}>Current Balance</div><div className={s.kpiValue}>${loan.principalBalance?.toLocaleString()}</div></div>
                            <div className={s.kpiCard}><div className={s.kpiLabel}>Interest Rate</div><div className={s.kpiValue}>{loan.interestRate}%</div></div>
                            <div className={s.kpiCard}><div className={s.kpiLabel}>Funded Date</div><div className={s.kpiValue}>{loan.fundedDate ? new Date(loan.fundedDate).toLocaleDateString() : '—'}</div></div>
                            <div className={s.kpiCard}><div className={s.kpiLabel}>Maturity Date</div><div className={s.kpiValue}>{loan.maturityDate ? new Date(loan.maturityDate).toLocaleDateString() : '—'}</div></div>
                        </div>
                    </div>

                    <div className={s.card}>
                        <div className={s.cardTitle}>Payment History</div>
                        {(loan.payments as any[] || []).length === 0 ? (
                            <div className={s.emptyState}>No payments recorded yet.</div>
                        ) : (
                            <table className={s.table}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(loan.payments as any[] || []).map(p => (
                                        <tr key={p.id}>
                                            <td>{new Date(p.date).toLocaleDateString()}</td>
                                            <td>${p.amount?.toLocaleString()}</td>
                                            <td>{p.type}</td>
                                            <td><span className={`${s.pill} ${p.status === 'cleared' ? s.pillGreen : s.pillYellow}`}>{p.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <button className={`${s.btn} ${s.btnPrimary} ${s.btnSmall}`} style={{ marginTop: 16 }}>+ Record Payment</button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className={s.card}>
                        <div className={s.cardTitle}>Loan Entities</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ padding: 12, border: '1px solid var(--bb-border)', borderRadius: 8 }}>
                                <div style={{ fontSize: 12, color: 'var(--bb-muted)', fontWeight: 600 }}>BORROWER</div>
                                <div style={{ fontWeight: 600 }}>{loan.deal?.borrower?.firstName} {loan.deal?.borrower?.lastName}</div>
                                <Link href={`/borrowers/${loan.deal?.borrowerId}`} style={{ fontSize: 13, color: 'var(--bb-accent)' }}>View Profile</Link>
                            </div>
                            <div style={{ padding: 12, border: '1px solid var(--bb-border)', borderRadius: 8 }}>
                                <div style={{ fontSize: 12, color: 'var(--bb-muted)', fontWeight: 600 }}>LENDER</div>
                                <div style={{ fontWeight: 600 }}>{loan.deal?.lender?.name || 'Private'}</div>
                                {loan.deal?.lenderId && <Link href={`/lenders/${loan.deal.lenderId}`} style={{ fontSize: 13, color: 'var(--bb-accent)' }}>View Lender</Link>}
                            </div>
                        </div>
                    </div>

                    <div className={s.card}>
                        <div className={s.cardTitle}>Incidental Fees</div>
                        {(loan.fees as any[] || []).length === 0 ? (
                            <div className={s.emptyState}>No incidental fees recorded.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {(loan.fees as any[] || []).map(f => (
                                    <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', border: '1px solid var(--bb-border)', borderRadius: 6 }}>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600 }}>{f.description}</div>
                                            <div style={{ fontSize: 11, color: 'var(--bb-muted)' }}>{f.type}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 700 }}>${f.amount}</div>
                                            <span style={{ fontSize: 10, color: f.isPaid ? 'var(--bb-success)' : 'var(--bb-danger)' }}>{f.isPaid ? 'PAID' : 'UNPAID'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`} style={{ marginTop: 16 }}>+ Add Fee</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
