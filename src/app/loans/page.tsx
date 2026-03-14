import prisma from '@/lib/prisma';
import Link from 'next/link';
import s from '@/styles/shared.module.css';

export const dynamic = 'force-dynamic';

export default async function LoansPage() {
    const loans = await prisma.loan.findMany({
        include: {
            deal: {
                include: { borrower: true, lender: true }
            }
        },
        orderBy: { fundedDate: 'desc' }
    });

    const activeLoans = loans.filter(l => l.status === 'active');
    const totalAUM = activeLoans.reduce((sum, l) => sum + l.principalBalance, 0);

    return (
        <div style={{ padding: '40px' }}>
            <div className={s.pageHeader}>
                <div>
                    <h1>Loan Management</h1>
                    <p>Track funded mortgages, principal balances, and payment health</p>
                </div>
            </div>

            <div className={s.kpiRow} style={{ marginBottom: 32 }}>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Active Loans</div>
                    <div className={s.kpiValue}>{activeLoans.length}</div>
                </div>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Total AUM</div>
                    <div className={s.kpiValue}>${(totalAUM / 1e6).toFixed(1)}M</div>
                </div>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Avg Rate</div>
                    <div className={s.kpiValue}>
                        {activeLoans.length > 0 ? (activeLoans.reduce((s, l) => s + l.interestRate, 0) / activeLoans.length).toFixed(2) : '0.00'}%
                    </div>
                </div>
            </div>

            <div className={s.card}>
                <div className={s.cardTitle}>Loan Portfolio</div>
                {loans.length === 0 ? (
                    <div className={s.emptyState}>No funded loans found. Deals marked as "Funded" will appear here.</div>
                ) : (
                    <table className={s.table}>
                        <thead>
                            <tr>
                                <th>Borrower</th>
                                <th>Lender</th>
                                <th>Principal</th>
                                <th>Rate</th>
                                <th>Maturity</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loans.map(l => (
                                <tr key={l.id}>
                                    <td style={{ fontWeight: 600 }}>
                                        {l.deal.borrower.firstName} {l.deal.borrower.lastName}
                                    </td>
                                    <td>{l.deal.lender?.name || '—'}</td>
                                    <td>${l.principalBalance.toLocaleString()}</td>
                                    <td>{l.interestRate}% ({l.interestType})</td>
                                    <td>{new Date(l.maturityDate).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`${s.pill} ${l.status === 'active' ? s.pillGreen : s.pillGray}`}>
                                            {l.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <Link href={`/loans/${l.id}`} className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`}>Manage</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
