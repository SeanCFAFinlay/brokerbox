import prisma from '@/lib/prisma';
import Link from 'next/link';
import s from '@/styles/shared.module.css';
import { notFound } from 'next/navigation';
import { runMatch } from '@/lib/matchEngine';

export const dynamic = 'force-dynamic';

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const deal = await prisma.deal.findUnique({
        where: { id },
        include: {
            borrower: true,
            lender: true,
            docRequests: { include: { files: true }, orderBy: { createdAt: 'desc' } },
        },
    });

    if (!deal) return notFound();

    // Fetch lenders to run match engine if a lender isn't already selected or if we just want to see options
    const lenders = await prisma.lender.findMany();

    const borrowerData = {
        creditScore: deal.borrower.creditScore,
        income: deal.borrower.income,
        province: deal.borrower.province,
        liabilities: deal.borrower.liabilities,
    };

    const dealData = {
        propertyValue: deal.propertyValue,
        loanAmount: deal.loanAmount,
        propertyType: deal.propertyType,
        ltv: deal.ltv || 0,
        gds: deal.gds || 0,
        tds: deal.tds || 0,
    };

    const matchResults = runMatch(borrowerData, dealData, lenders).slice(0, 3); // top 3

    return (
        <>
            <div className={s.pageHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontSize: 13, color: 'var(--bb-muted)', marginBottom: 4 }}>
                            <Link href="/deals" style={{ color: 'var(--bb-accent)' }}>Deal Desk</Link> /
                            <Link href={`/borrowers/${deal.borrowerId}`} style={{ color: 'var(--bb-accent)', marginLeft: 4 }}>{deal.borrower.firstName} {deal.borrower.lastName}</Link>
                        </p>
                        <h1>{deal.propertyAddress ? deal.propertyAddress : `Deal #${deal.id.slice(-6)}`}</h1>
                    </div>
                    <span className={`${s.pill} ${deal.stage === 'funded' ? s.pillGreen : deal.stage === 'approved' ? s.pillBlue : s.pillGray}`}>{deal.stage.toUpperCase()}</span>
                </div>
            </div>

            <div className={s.kpiRow} style={{ marginBottom: 24 }}>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Loan Amount</div><div className={s.kpiValue}>${deal.loanAmount.toLocaleString()}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Property Value</div><div className={s.kpiValue}>${deal.propertyValue.toLocaleString()}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>LTV</div><div className={s.kpiValue}>{deal.ltv ? `${deal.ltv.toFixed(1)}%` : '—'}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Lender</div><div className={s.kpiValue} style={{ fontSize: 18 }}>{deal.lender?.name || 'Unassigned'}</div></div>
            </div>

            <div className={s.grid2}>
                {/* Deal Details Box */}
                <div className={s.card}>
                    <div className={s.cardTitle}>Deal Parameters</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--bb-muted)' }}>Property Type:</span> <span>{deal.propertyType}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--bb-muted)' }}>GDS / TDS:</span> <span>{deal.gds?.toFixed(1) || 0}% / {deal.tds?.toFixed(1) || 0}%</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--bb-muted)' }}>Amortization:</span> <span>{deal.amortMonths} mos</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--bb-muted)' }}>Interest Rate:</span> <span>{deal.interestRate ? `${deal.interestRate}%` : '—'}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--bb-muted)' }}>Monthly Payment:</span> <span>{deal.monthlyPayment ? `$${deal.monthlyPayment.toLocaleString()}` : '—'}</span></div>
                        {deal.notes && (
                            <div style={{ marginTop: 8, padding: 12, backgroundColor: 'var(--bb-bg)', borderRadius: 6, fontSize: 13 }}>
                                <strong>Notes:</strong> {deal.notes}
                            </div>
                        )}
                    </div>
                </div>

                {/* Match Engine Top 3 */}
                <div className={s.card}>
                    <div className={s.cardTitle}>Top Lender Matches</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {matchResults.map((r, i) => (
                            <div key={r.lenderId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, backgroundColor: 'var(--bb-bg)', borderRadius: 8, opacity: r.passed ? 1 : 0.6 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--bb-muted)', width: 20 }}>#{i + 1}</div>
                                <div className={`${s.scoreCircle} ${r.score >= 70 ? s.scoreHigh : r.score >= 40 ? s.scoreMed : s.scoreLow}`} style={{ width: 36, height: 36, fontSize: 14 }}>
                                    {r.score}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--bb-text)' }}>
                                        <Link href={`/lenders/${r.lenderId}`} style={{ color: 'inherit', textDecoration: 'none' }}>{r.lenderName}</Link>
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--bb-text-secondary)' }}>
                                        Est. Rate: {r.effectiveRate.toFixed(2)}% · {r.passed ? <span style={{ color: 'var(--bb-success)' }}>✓ Qualified</span> : <span style={{ color: 'var(--bb-danger)' }}>✗ {r.failures.length} flags</span>}
                                    </div>
                                </div>
                                <button className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`}>Select</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Document Requests */}
            <div className={s.card} style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div className={s.cardTitle} style={{ marginBottom: 0 }}>Deal Documents</div>
                    <Link href="/docvault" className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`}>Go to DocVault</Link>
                </div>

                {deal.docRequests.length === 0 ? (
                    <div className={s.emptyState}>No documents requested for this deal.</div>
                ) : (
                    <table className={s.table}>
                        <thead><tr><th>Document</th><th>Status</th><th>Files</th><th>Notes</th></tr></thead>
                        <tbody>
                            {deal.docRequests.map(dr => (
                                <tr key={dr.id}>
                                    <td style={{ fontWeight: 600 }}>{dr.docType}</td>
                                    <td><span className={`${s.pill} ${dr.status === 'verified' ? s.pillGreen : dr.status === 'uploaded' ? s.pillBlue : dr.status === 'rejected' ? s.pillRed : s.pillYellow}`}>{dr.status}</span></td>
                                    <td>{dr.files.length > 0 ? `${dr.files.length} file(s)` : 'None'}</td>
                                    <td style={{ fontSize: 13, color: 'var(--bb-muted)' }}>{dr.notes || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
