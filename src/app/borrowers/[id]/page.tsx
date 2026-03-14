import prisma from '@/lib/prisma';
import Link from 'next/link';
import s from '@/styles/shared.module.css';
import { notFound } from 'next/navigation';
import BorrowerEditForm from './BorrowerEditForm';
import NoteTimeline from '@/components/NoteTimeline';
import TaskList from '@/components/TaskList';
import { leadFreshness, documentCompleteness, getNextBestActions } from '@/lib/domain';

export const dynamic = 'force-dynamic';

export default async function BorrowerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const borrower = await prisma.borrower.findUnique({
        where: { id },
        include: {
            deals: { include: { lender: true }, orderBy: { updatedAt: 'desc' } },
            scenarios: { orderBy: { createdAt: 'desc' } },
            docRequests: { include: { files: true }, orderBy: { createdAt: 'desc' } },
        },
    });

    if (!borrower) return notFound();

    const freshness = leadFreshness(
        { id: borrower.id, updatedAt: borrower.updatedAt },
        borrower.deals[0]?.updatedAt
    );
    const docStats = documentCompleteness(
        borrower.docRequests.map((d) => ({
            id: d.id,
            status: d.status,
            createdAt: d.createdAt,
            expiresAt: d.expiresAt,
        }))
    );
    const nbaForBorrower = getNextBestActions(
        [{ id: borrower.id, updatedAt: borrower.updatedAt }],
        borrower.deals.map((d) => ({ id: d.id, borrowerId: d.borrowerId, stage: d.stage, updatedAt: d.updatedAt })),
        [],
        borrower.docRequests.map((d) => ({ id: d.id, borrowerId: d.borrowerId, dealId: d.dealId, status: d.status, createdAt: d.createdAt }))
    ).filter((a) => a.entityId === id).slice(0, 3);

    return (
        <>
            <div className={s.pageHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontSize: 13, color: 'var(--bb-muted)', marginBottom: 4 }}><Link href="/borrowers" style={{ color: 'var(--bb-accent)' }}>Borrowers</Link> / {borrower.firstName} {borrower.lastName}</p>
                        <h1>{borrower.firstName} {borrower.lastName}</h1>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className={`${s.pill} ${freshness.label === 'hot' ? s.pillGreen : freshness.label === 'warm' ? s.pillBlue : freshness.label === 'cool' ? s.pillYellow : s.pillGray}`} title={`${freshness.daysSinceActivity} days since activity`}>
                            {freshness.label}
                        </span>
                        <span className={`${s.pill} ${borrower.status === 'active' ? s.pillGreen : s.pillGray}`}>{borrower.status}</span>
                    </div>
                </div>
            </div>

            {/* Profile summary */}
            <div className={s.kpiRow} style={{ marginBottom: 24 }}>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Credit Score</div><div className={s.kpiValue}>{borrower.creditScore}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Annual Income</div><div className={s.kpiValue}>${borrower.income.toLocaleString()}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Province</div><div className={s.kpiValue}>{borrower.province}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Employment</div><div className={s.kpiValue} style={{ fontSize: 18 }}>{borrower.employmentStatus}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Active Deals</div><div className={s.kpiValue}>{borrower.deals.length}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Docs Complete</div><div className={s.kpiValue}>{docStats.pctComplete}%</div><div className={s.kpiSub}>{docStats.verified}/{docStats.requested || 1} verified</div></div>
            </div>

            {nbaForBorrower.length > 0 && (
                <div className={s.card} style={{ marginBottom: 24 }}>
                    <div className={s.cardTitle}>Suggested next steps</div>
                    <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--bb-text-secondary)' }}>
                        {nbaForBorrower.map((a) => (
                            <li key={a.type + a.entityId}>
                                {a.href ? <Link href={a.href} style={{ color: 'var(--bb-accent)' }}>{a.title}</Link> : a.title} — {a.reason}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Edit Form + Doc Checklist grid  */}
            <div className={s.grid2}>
                <BorrowerEditForm borrower={{
                    id: borrower.id,
                    firstName: borrower.firstName,
                    lastName: borrower.lastName,
                    email: borrower.email,
                    phone: borrower.phone,
                    address: borrower.address,
                    city: borrower.city,
                    province: borrower.province,
                    postalCode: borrower.postalCode,
                    income: borrower.income,
                    verifiedIncome: borrower.verifiedIncome,
                    employmentStatus: borrower.employmentStatus,
                    borrowerType: borrower.borrowerType,
                    liabilities: borrower.liabilities,
                    creditScore: borrower.creditScore,
                    coBorrowerName: borrower.coBorrowerName,
                    coBorrowerEmail: borrower.coBorrowerEmail,
                    notes: borrower.notes,
                    status: borrower.status,
                }} />

                {/* Doc Checklist */}
                <div className={s.card}>
                    <div className={s.cardTitle}>Document Checklist</div>
                    {borrower.docRequests.length === 0 ? (
                        <div className={s.emptyState}>No document requests yet.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {borrower.docRequests.map(dr => {
                                const statusColor = dr.status === 'verified' ? s.pillGreen : dr.status === 'uploaded' ? s.pillBlue : dr.status === 'rejected' ? s.pillRed : s.pillYellow;
                                return (
                                    <div key={dr.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, paddingBottom: 8, borderBottom: '1px solid var(--bb-border)' }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{dr.docType}</div>
                                            <div style={{ fontSize: 11, color: 'var(--bb-muted)', textTransform: 'uppercase' }}>{dr.category || 'GENERAL'}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span className={`${s.pill} ${statusColor}`}>{dr.status}</span>
                                            {dr.expiresAt && <div style={{ fontSize: 11, marginTop: 4, color: new Date(dr.expiresAt) < new Date() ? 'var(--bb-danger)' : 'var(--bb-warning)' }}>Exp: {new Date(dr.expiresAt).toLocaleDateString()}</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className={s.card} style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div className={s.cardTitle} style={{ marginBottom: 0 }}>Deals</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Link href={`/deals`} className={`${s.btn} ${s.btnPrimary} ${s.btnSmall}`}>+ Create Deal</Link>
                        <Link href={`/deals?borrowerId=${borrower.id}`} className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`}>View All</Link>
                    </div>
                </div>
                {borrower.deals.length === 0 ? (
                    <div className={s.emptyState}>No deals yet.</div>
                ) : (
                    <table className={s.table}>
                        <thead><tr><th>Property</th><th>Loan</th><th>LTV</th><th>Stage</th><th>Lender</th></tr></thead>
                        <tbody>
                            {borrower.deals.map(d => (
                                <tr key={d.id}>
                                    <td><Link href={`/deals/${d.id}`} style={{ color: 'var(--bb-accent)', fontWeight: 600 }}>{d.propertyAddress || '—'}</Link></td>
                                    <td>${d.loanAmount.toLocaleString()}</td>
                                    <td>{d.ltv ? `${d.ltv.toFixed(1)}%` : '—'}</td>
                                    <td><span className={`${s.pill} ${d.stage === 'funded' ? s.pillGreen : d.stage === 'committed' ? s.pillBlue : s.pillGray}`}>{d.stage}</span></td>
                                    <td>{d.lender?.name || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Notes & Tasks */}
            <div className={s.grid2} style={{ marginTop: 24 }}>
                <div className={s.card}>
                    <div className={s.cardTitle}>Borrower Notes</div>
                    <NoteTimeline entityType="Borrower" entityId={borrower.id} />
                </div>
                <div className={s.card}>
                    <TaskList entityType="Borrower" entityId={borrower.id} />
                </div>
            </div>

            {/* Scenarios */}
            {borrower.scenarios.length > 0 && (
                <div className={s.card} style={{ marginTop: 24 }}>
                    <div className={s.cardTitle}>Saved Scenarios</div>
                    <table className={s.table}>
                        <thead><tr><th>Name</th><th>Type</th><th>Loan</th><th>Payment</th><th>Created</th></tr></thead>
                        <tbody>
                            {borrower.scenarios.map(sc => {
                                const r = sc.results as Record<string, number>;
                                return (
                                    <tr key={sc.id}>
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
        </>
    );
}
