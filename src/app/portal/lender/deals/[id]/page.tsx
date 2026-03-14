import prisma from '@/lib/prisma';
import Link from 'next/link';
import s from '@/styles/shared.module.css';
import { notFound } from 'next/navigation';
import LenderDealActions from './LenderDealActions';

export const dynamic = 'force-dynamic';

export default async function LenderDealReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Auth validation mock
    const lender = await prisma.lender.findFirst({ where: { status: 'active' } });
    if (!lender) return <div>No Lender Found</div>;

    const deal = await prisma.deal.findUnique({
        where: { id },
        include: {
            borrower: true,
            docRequests: { include: { files: true }, orderBy: { createdAt: 'desc' } }
        }
    });

    const conditions = await prisma.dealCondition.findMany({
        where: { dealId: id },
        orderBy: { createdAt: 'desc' }
    });

    if (!deal) return notFound();

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
            <div className={s.pageHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontSize: 13, color: 'var(--bb-muted)', marginBottom: 4 }}>
                            <Link href="/portal/lender/deals" style={{ color: 'var(--bb-accent)' }}>Pipeline</Link> /
                            Review: {deal.propertyAddress || `Deal #${deal.id.slice(-6)}`}
                        </p>
                        <h1>Review Submission</h1>
                    </div>
                    <span className={`${s.pill} ${deal.stage === 'funded' ? s.pillGreen : deal.stage === 'committed' ? s.pillBlue : s.pillYellow}`}>
                        {deal.stage.replace('_', ' ').toUpperCase()}
                    </span>
                </div>
            </div>

            <div className={s.grid2}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Deal Metadata */}
                    <div className={s.card}>
                        <div className={s.cardTitle}>Application Details</div>
                        <div className={s.kpiRow} style={{ marginBottom: 16 }}>
                            <div className={s.kpiCard} style={{ padding: 12 }}><div className={s.kpiLabel}>Loan Requested</div><div className={s.kpiValue} style={{ fontSize: 20 }}>${deal.loanAmount.toLocaleString()}</div></div>
                            <div className={s.kpiCard} style={{ padding: 12 }}><div className={s.kpiLabel}>Property Value</div><div className={s.kpiValue} style={{ fontSize: 20 }}>${deal.propertyValue.toLocaleString()}</div></div>
                            <div className={s.kpiCard} style={{ padding: 12 }}><div className={s.kpiLabel}>LTV</div><div className={s.kpiValue} style={{ fontSize: 20 }}>{deal.ltv ? `${deal.ltv.toFixed(1)}%` : '—'}</div></div>
                        </div>
                        <table className={s.table}>
                            <tbody>
                                <tr><td style={{ fontWeight: 600, width: 140 }}>Position</td><td>{deal.position}</td></tr>
                                <tr><td style={{ fontWeight: 600 }}>Property Type</td><td style={{ textTransform: 'capitalize' }}>{deal.propertyType}</td></tr>
                                <tr><td style={{ fontWeight: 600 }}>Loan Purpose</td><td style={{ textTransform: 'capitalize' }}>{deal.loanPurpose.replace('_', ' ')}</td></tr>
                                {deal.interestRate && <tr><td style={{ fontWeight: 600 }}>Suggested Rate</td><td>{deal.interestRate.toFixed(2)}%</td></tr>}
                            </tbody>
                        </table>
                    </div>

                    {/* Borrower Metadata */}
                    <div className={s.card}>
                        <div className={s.cardTitle}>Applicant Profile</div>
                        <table className={s.table}>
                            <tbody>
                                <tr><td style={{ fontWeight: 600, width: 140 }}>Name</td><td>{deal.borrower.firstName} {deal.borrower.lastName}</td></tr>
                                <tr><td style={{ fontWeight: 600 }}>Credit Score</td><td><span className={`${s.pill} ${deal.borrower.creditScore >= 680 ? s.pillGreen : deal.borrower.creditScore >= 600 ? s.pillYellow : s.pillRed}`}>{deal.borrower.creditScore}</span></td></tr>
                                <tr><td style={{ fontWeight: 600 }}>Annual Income</td><td>${deal.borrower.income.toLocaleString()} ({deal.borrower.employmentStatus})</td></tr>
                                <tr><td style={{ fontWeight: 600 }}>Liabilities</td><td>${deal.borrower.liabilities.toLocaleString()}</td></tr>
                                <tr><td style={{ fontWeight: 600 }}>GDS / TDS</td><td>{deal.gds ? `${deal.gds.toFixed(1)}%` : '—'} / {deal.tds ? `${deal.tds.toFixed(1)}%` : '—'}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Action Panel */}
                    <LenderDealActions dealId={deal.id} stage={deal.stage} />

                    {/* Documents */}
                    <div className={s.card}>
                        <div className={s.cardTitle}>Supporting Documents</div>
                        {deal.docRequests.length === 0 ? (
                            <div className={s.emptyState}>No documents provided by broker yet.</div>
                        ) : (
                            <table className={s.table}>
                                <tbody>
                                    {deal.docRequests.map(dr => (
                                        <tr key={dr.id}>
                                            <td style={{ fontWeight: 600 }}>{dr.docType}</td>
                                            <td><span className={`${s.pill} ${dr.status === 'verified' ? s.pillGreen : s.pillYellow}`}>{dr.status}</span></td>
                                            <td style={{ fontSize: 13, color: 'var(--bb-accent)' }}>{dr.files.length} File(s)</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Conditions */}
                    <div className={s.card}>
                        <div className={s.cardTitle}>Stipulations & Conditions</div>
                        {conditions.length === 0 ? (
                            <div className={s.emptyState}>No conditions requested yet.</div>
                        ) : (
                            <table className={s.table}>
                                <tbody>
                                    {conditions.map(c => (
                                        <tr key={c.id}>
                                            <td>{c.description}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <span className={`${s.pill} ${c.status === 'met' || c.status === 'waived' ? s.pillGreen : s.pillYellow}`}>
                                                    {c.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
