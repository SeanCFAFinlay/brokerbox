import prisma from '@/lib/prisma';
import Link from 'next/link';
import s from '@/styles/shared.module.css';
import { notFound } from 'next/navigation';
import { runMatch } from '@/lib/matchEngine';
import DealEditForm from './DealEditForm';
import NoteTimeline from '@/components/NoteTimeline';

export const dynamic = 'force-dynamic';

const stageColor = (stage: string) =>
    stage === 'funded' ? s.pillGreen
        : stage === 'committed' ? s.pillBlue
            : stage === 'matched' ? s.pillYellow
                : stage === 'declined' || stage === 'archived' ? s.pillRed
                    : s.pillGray;

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const deal = await prisma.deal.findUnique({
        where: { id },
        include: {
            borrower: true,
            lender: true,
            docRequests: { include: { files: true }, orderBy: { createdAt: 'desc' } },
            stageHistory: { orderBy: { changedAt: 'desc' } },
            scenarios: { orderBy: { createdAt: 'desc' } },
        },
    });

    if (!deal) return notFound();

    const allLenders = await prisma.lender.findMany({ where: { status: 'active' }, select: { id: true, name: true } });

    // Run match engine for top 3
    const lenders = await prisma.lender.findMany({ where: { status: 'active' } });
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
    const matchResults = runMatch(borrowerData, dealData, lenders as any).slice(0, 3);

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
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className={`${s.pill} ${deal.priority === 'urgent' ? s.pillRed : deal.priority === 'high' ? s.pillYellow : s.pillGray}`}>{deal.priority}</span>
                        <span className={`${s.pill} ${stageColor(deal.stage)}`}>{deal.stage.replace('_', ' ').toUpperCase()}</span>
                    </div>
                </div>
            </div>

            <div className={s.kpiRow} style={{ marginBottom: 24 }}>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Loan Amount</div><div className={s.kpiValue}>${deal.loanAmount.toLocaleString()}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Property Value</div><div className={s.kpiValue}>${deal.propertyValue.toLocaleString()}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>LTV</div><div className={s.kpiValue}>{deal.ltv ? `${deal.ltv.toFixed(1)}%` : '—'}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Position</div><div className={s.kpiValue}>{deal.position}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Lender</div><div className={s.kpiValue} style={{ fontSize: 18 }}>{deal.lender?.name || 'Unassigned'}</div></div>
            </div>

            <div className={s.grid2}>
                {/* Deal Edit Form */}
                <DealEditForm
                    deal={{
                        id: deal.id,
                        stage: deal.stage,
                        priority: deal.priority,
                        propertyAddress: deal.propertyAddress,
                        propertyType: deal.propertyType,
                        propertyValue: deal.propertyValue,
                        loanAmount: deal.loanAmount,
                        interestRate: deal.interestRate,
                        termMonths: deal.termMonths,
                        amortMonths: deal.amortMonths,
                        position: deal.position,
                        loanPurpose: deal.loanPurpose,
                        occupancyType: deal.occupancyType,
                        exitStrategy: deal.exitStrategy,
                        brokerFee: deal.brokerFee,
                        lenderFee: deal.lenderFee,
                        notes: deal.notes,
                    }}
                    lenders={allLenders}
                    currentLenderId={deal.lenderId}
                />

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
                            </div>
                        ))}
                        {matchResults.length === 0 && <div className={s.emptyState}>No match results.</div>}
                    </div>
                </div>
            </div>

            {/* Stage History */}
            {deal.stageHistory.length > 0 && (
                <div className={s.card} style={{ marginTop: 24 }}>
                    <div className={s.cardTitle}>Stage History</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {deal.stageHistory.map((h: any) => (
                            <div key={h.id} style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13, color: 'var(--bb-text-secondary)' }}>
                                <span className={`${s.pill} ${stageColor(h.fromStage)}`} style={{ fontSize: 11 }}>{h.fromStage.replace('_', ' ')}</span>
                                <span>→</span>
                                <span className={`${s.pill} ${stageColor(h.toStage)}`} style={{ fontSize: 11 }}>{h.toStage.replace('_', ' ')}</span>
                                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--bb-muted)' }}>{new Date(h.changedAt).toLocaleString()} · {h.changedBy}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Notes */}
            <div style={{ marginTop: 24 }}>
                <NoteTimeline entityType="Deal" entityId={deal.id} />
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
