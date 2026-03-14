import Link from 'next/link';
import s from '@/styles/shared.module.css';
import { notFound } from 'next/navigation';
import { runMatch, dealStallRisk, documentCompleteness, getNextBestActions } from '@/lib/domain';
import DealEditForm, { type DealEditFormProps } from './DealEditForm';
import NoteTimeline from '@/components/NoteTimeline';
import TaskList from '@/components/TaskList';
import ConditionsManager from './ConditionsManager';
import FundDealAction from './FundDealAction';
import ApplyMatchButton from './ApplyMatchButton';
import AuditTimeline from '@/components/AuditTimeline';
import CalendarHighlights from '@/components/CalendarHighlights';
import { selectDealDetailById } from '@/lib/supabase/queries';
import { getAdminClient, rowsToApp } from '@/lib/db';

export const dynamic = 'force-dynamic';

const stageColor = (stage: string) =>
    stage === 'funded' ? s.pillGreen
        : stage === 'committed' ? s.pillBlue
            : stage === 'matched' ? s.pillYellow
                : stage === 'declined' || stage === 'archived' ? s.pillRed
                    : s.pillGray;

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let deal: Awaited<ReturnType<typeof selectDealDetailById>>;
    try {
        deal = await selectDealDetailById(id);
    } catch {
        return notFound();
    }

    const supabase = getAdminClient();
    const { data: lendersData } = await supabase.from('lender').select('id, name').eq('status', 'active');
    const allLenders = rowsToApp(lendersData ?? []);
    const { data: rawLendersData } = await supabase.from('lender').select('*').eq('status', 'active');
    const rawLenders = rowsToApp(rawLendersData ?? []);
    const borrower = deal.borrower as Record<string, unknown> | null | undefined;
    const borrowerData = {
        creditScore: (borrower?.creditScore as number) || 0,
        income: (borrower?.income as number) || 0,
        province: (borrower?.province as string) || '',
        city: (borrower?.city as string) || '',
        liabilities: (borrower?.liabilities as number) || 0,
    };
    const dealData = {
        propertyValue: deal.propertyValue as number,
        loanAmount: deal.loanAmount as number,
        propertyType: deal.propertyType as string,
        ltv: (deal.ltv as number) || 0,
        gds: (deal.gds as number) || 0,
        tds: (deal.tds as number) || 0,
        position: deal.position as string,
        loanPurpose: deal.loanPurpose as string,
        termMonths: deal.termMonths as number
    };
    const lenders = (rawLenders as Record<string, unknown>[]).map((l: Record<string, unknown>) => ({
        ...l,
        pricingPremium: l.pricingPremium,
        documentRequirements: l.documentRequirements,
        allowsSelfEmployed: l.allowsSelfEmployed ?? true,
        ruralMaxLTV: l.ruralMaxLTV ?? l.maxLTV,
    }));
    const matchResults = runMatch(borrowerData, dealData, lenders as any).slice(0, 3);

    const toDate = (v: unknown) => (v instanceof Date ? v : v != null ? new Date(v as string) : null);
    const dealSnapshot = {
        id: deal.id as string,
        stage: deal.stage as string,
        updatedAt: toDate(deal.updatedAt) ?? new Date(),
        createdAt: toDate(deal.createdAt) ?? new Date(),
        fundingDate: toDate(deal.fundingDate),
        closingDate: toDate(deal.closingDate),
        priority: deal.priority as string | undefined,
    };
    const tasksList = (deal.tasks ?? []) as { id: string; dueDate: unknown; status: string; dealId: string }[];
    const conditionsList = (deal.conditions ?? []) as { id: string; status: string }[];
    const docRequestsList = (deal.docRequests ?? []) as { id: string; status: string; createdAt: unknown; expiresAt: unknown }[];
    const stall = dealStallRisk(
        dealSnapshot,
        tasksList.map((t) => ({ id: t.id, dueDate: t.dueDate != null ? (t.dueDate instanceof Date ? t.dueDate : new Date(t.dueDate as string)) : null, status: t.status, dealId: t.dealId })),
        conditionsList.map((c) => ({ id: c.id, status: c.status })),
        docRequestsList.map((d) => ({
            id: d.id,
            status: d.status,
            createdAt: toDate(d.createdAt) ?? new Date(),
            expiresAt: d.expiresAt != null ? (toDate(d.expiresAt) ?? new Date()) : null,
        }))
    );
    const docStats = documentCompleteness(
        docRequestsList.map((d) => ({
            id: d.id,
            status: d.status,
            createdAt: toDate(d.createdAt) ?? new Date(),
            expiresAt: d.expiresAt != null ? (toDate(d.expiresAt) ?? new Date()) : null,
        }))
    );
    const borrowerId = deal.borrowerId as string;
    const nbaBorrowerSnap = { id: borrower?.id as string, updatedAt: toDate(borrower?.updatedAt) ?? new Date() };
    const nbaDealSnap = { id: deal.id as string, borrowerId, stage: deal.stage as string, updatedAt: toDate(deal.updatedAt) ?? new Date() };
    const nbaTasksSnap = tasksList.map((t) => ({
        id: t.id,
        dueDate: t.dueDate != null ? (t.dueDate instanceof Date ? t.dueDate : new Date(t.dueDate as string)) : null,
        status: t.status,
        dealId: t.dealId,
        entityType: (t as Record<string, unknown>).entityType as string | null,
        entityId: (t as Record<string, unknown>).entityId as string | null,
    }));
    const nbaDocSnap = docRequestsList.map((d) => ({ id: d.id, borrowerId, dealId: deal.id as string, status: d.status, createdAt: toDate(d.createdAt) ?? new Date() }));
    const nbaForDeal = getNextBestActions([nbaBorrowerSnap], [nbaDealSnap], nbaTasksSnap, nbaDocSnap).filter((a) => a.entityId === id).slice(0, 4);

    return (
        <>
            <div className={s.pageHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontSize: 13, color: 'var(--bb-muted)', marginBottom: 4 }}>
                            <Link href="/deals" style={{ color: 'var(--bb-accent)' }}>Deal Desk</Link> /
                            <Link href={`/borrowers/${deal.borrowerId}`} style={{ color: 'var(--bb-accent)', marginLeft: 4 }}>{String(borrower?.firstName ?? '')} {String(borrower?.lastName ?? '')}</Link>
                        </p>
                        <h1>{deal.propertyAddress ? String(deal.propertyAddress) : `Deal #${String(deal.id).slice(-6)}`}</h1>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {stall.label !== 'low' && (
                            <span className={`${s.pill} ${stall.label === 'high' ? s.pillRed : s.pillYellow}`} title={stall.reasons.join(' · ')}>
                                Risk: {stall.label}
                            </span>
                        )}
                        <span className={`${s.pill} ${String(deal.priority) === 'urgent' ? s.pillRed : String(deal.priority) === 'high' ? s.pillYellow : s.pillGray}`}>{String(deal.priority ?? '')}</span>
                        <span className={`${s.pill} ${stageColor(deal.stage as string)}`}>{(deal.stage as string).replace('_', ' ').toUpperCase()}</span>
                    </div>
                </div>
            </div>

            {nbaForDeal.length > 0 && (
                <div className={s.card} style={{ marginBottom: 24, borderLeft: '4px solid var(--bb-accent)' }}>
                    <div className={s.cardTitle} style={{ marginBottom: 8 }}>Suggested next steps</div>
                    <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--bb-text-secondary)' }}>
                        {nbaForDeal.map((a) => (
                            <li key={a.type + a.entityId}>
                                {a.href ? <Link href={a.href} style={{ color: 'var(--bb-accent)' }}>{a.title}</Link> : a.title} — {a.reason}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className={s.kpiRow} style={{ marginBottom: 24 }}>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Loan Amount</div><div className={s.kpiValue}>${Number(deal.loanAmount ?? 0).toLocaleString()}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Property Value</div><div className={s.kpiValue}>${Number(deal.propertyValue ?? 0).toLocaleString()}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>LTV</div><div className={s.kpiValue}>{deal.ltv != null ? `${Number(deal.ltv).toFixed(1)}% ` : '—'}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Position</div><div className={s.kpiValue}>{String(deal.position ?? '')}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Lender</div><div className={s.kpiValue} style={{ fontSize: 18 }}>{(deal.lender as Record<string, unknown>)?.name ? String((deal.lender as Record<string, unknown>).name) : 'Unassigned'}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Docs</div><div className={s.kpiValue} title={`${docStats.verified}/${docStats.requested} verified`}>{docStats.requested ? `${docStats.pctComplete}%` : '—'}</div></div>
            </div>

            <div className={s.grid2}>
                {/* Deal Edit Form */}
                <DealEditForm
                    deal={{
                        id: deal.id as string,
                        stage: deal.stage as string,
                        priority: (deal.priority as string) ?? 'normal',
                        propertyAddress: deal.propertyAddress != null ? String(deal.propertyAddress) : null,
                        propertyType: (deal.propertyType as string) ?? 'residential',
                        propertyValue: Number(deal.propertyValue ?? 0),
                        loanAmount: Number(deal.loanAmount ?? 0),
                        interestRate: deal.interestRate != null ? Number(deal.interestRate) : null,
                        termMonths: Number(deal.termMonths ?? 12),
                        amortMonths: Number(deal.amortMonths ?? 300),
                        position: (deal.position as string) ?? '1st',
                        loanPurpose: (deal.loanPurpose as string) ?? 'purchase',
                        occupancyType: (deal.occupancyType as string) ?? 'owner_occupied',
                        exitStrategy: deal.exitStrategy != null ? String(deal.exitStrategy) : null,
                        brokerFee: deal.brokerFee != null ? Number(deal.brokerFee) : null,
                        lenderFee: deal.lenderFee != null ? Number(deal.lenderFee) : null,
                        agentCommissionSplit: Number(deal.agentCommissionSplit ?? 0),
                        totalRevenue: deal.totalRevenue != null ? Number(deal.totalRevenue) : null,
                        netBrokerageRevenue: deal.netBrokerageRevenue != null ? Number(deal.netBrokerageRevenue) : null,
                        notes: deal.notes != null ? String(deal.notes) : null,
                    }}
                    lenders={allLenders as { id: string; name: string }[]}
                    currentLenderId={deal.lenderId != null ? String(deal.lenderId) : null}
                />

                {/* Match Engine Top 3 */}
                <div className={s.card}>
                    <div className={s.cardTitle}>Top Lender Matches</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {matchResults.map((r, i) => (
                            <div key={r.lenderId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, backgroundColor: 'var(--bb-bg)', borderRadius: 8, opacity: r.passed ? 1 : 0.6 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--bb-muted)', width: 20 }}>#{i + 1}</div>
                                <div className={`${s.scoreCircle} ${r.score >= 70 ? s.scoreHigh : r.score >= 40 ? s.scoreMed : s.scoreLow} `} style={{ width: 36, height: 36, fontSize: 14 }}>
                                    {r.score}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--bb-text)' }}>
                                            <Link href={`/lenders/${r.lenderId}`} style={{ color: 'inherit', textDecoration: 'none' }}>{r.lenderName}</Link>
                                        </div>
                                        {deal.lenderId !== r.lenderId && (
                                            <ApplyMatchButton dealId={String(deal.id)} borrowerId={String(deal.borrowerId)} lenderId={r.lenderId} />
                                        )}
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

                {/* Borrower Summary */}
                <div className={s.card}>
                    <div className={s.cardTitle}>Borrower Summary</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                        <div><strong style={{ display: 'inline-block', width: 120 }}>Primary:</strong> {String(borrower?.firstName ?? '')} {String(borrower?.lastName ?? '')}</div>
                        <div><strong style={{ display: 'inline-block', width: 120 }}>Email:</strong> {String(borrower?.email ?? '')}</div>
                        <div><strong style={{ display: 'inline-block', width: 120 }}>Phone:</strong> {String(borrower?.phone ?? '')}</div>
                        <div><strong style={{ display: 'inline-block', width: 120 }}>Income:</strong> ${Number(borrower?.income ?? 0).toLocaleString()} ({String(borrower?.borrowerType ?? 'employed')})</div>
                        <div><strong style={{ display: 'inline-block', width: 120 }}>Credit Score:</strong> <span className={`${s.pill} ${Number(borrower?.creditScore ?? 0) >= 700 ? s.pillGreen : Number(borrower?.creditScore ?? 0) >= 600 ? s.pillYellow : s.pillRed} `}>{Number(borrower?.creditScore ?? 0)}</span></div>
                        {borrower?.coBorrowerName && (
                            <div><strong style={{ display: 'inline-block', width: 120 }}>Co-Borrower:</strong> {String(borrower.coBorrowerName)}</div>
                        )}
                        <Link href={`/borrowers/${deal.borrowerId}`} className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`} style={{ alignSelf: 'flex-start', marginTop: 8 }}>View Full Profile</Link>
                    </div>
                </div>
            </div>

            {/* Scenarios */}
            <div className={s.card} style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div className={s.cardTitle} style={{ marginBottom: 0 }}>Saved Scenarios</div>
                    <Link href="/scenarios" className={`${s.btn} ${s.btnSecondary} ${s.btnSmall} `}>+ Scenario Builder</Link>
                </div>
                {((deal.scenarios ?? []) as unknown[]).length === 0 ? (
                    <div className={s.emptyState}>No scenarios linked to this deal.</div>
                ) : (
                    <table className={s.table}>
                        <thead><tr><th>Lender</th><th>Rate</th><th>Term</th><th>Monthly Payment</th><th>Rec</th></tr></thead>
                        <tbody>
                            {((deal.scenarios ?? []) as Array<Record<string, unknown>>).map((sc) => {
                                const r = (sc.results ?? {}) as Record<string, number>;
                                const i = (sc.inputs ?? {}) as Record<string, unknown>;
                                return (
                                    <tr key={String(sc.id)}>
                                        <td style={{ fontWeight: 600 }}>{String(i.lenderName ?? sc.name ?? '')}</td>
                                        <td>{typeof r.rate === 'number' ? r.rate.toFixed(2) : '0.00'}%</td>
                                        <td>{Number(r.termMonths ?? 0)} mos</td>
                                        <td>${Number(r.monthlyPayment ?? 0).toLocaleString()}</td>
                                        <td>{sc.isPreferred ? <span className={`${s.pill} ${s.pillGreen} `}>Preferred</span> : '—'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Activity & History */}
            <div className={s.grid2} style={{ marginTop: 24 }}>
                <div className={s.card}>
                    <div className={s.cardTitle}>Deal Activity Trail</div>
                    <AuditTimeline entityType="Deal" entityId={String(deal.id)} />

                    <div style={{ marginTop: 24 }}>
                        <div style={{ fontSize: 13, textTransform: 'uppercase', fontWeight: 600, color: 'var(--bb-muted)', marginBottom: 12 }}>Stage Transitions</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {((deal.stageHistory ?? []) as { id: string; fromStage: string; toStage: string; changedAt: string }[]).map((h) => (
                                <div key={h.id} style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13, color: 'var(--bb-text-secondary)' }}>
                                    <span className={`${s.pill} ${stageColor(h.fromStage)}`} style={{ fontSize: 11 }}>{h.fromStage.replace('_', ' ')}</span>
                                    <span>→</span>
                                    <span className={`${s.pill} ${stageColor(h.toStage)}`} style={{ fontSize: 11 }}>{h.toStage.replace('_', ' ')}</span>
                                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--bb-muted)' }}>{new Date(h.changedAt).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={s.card}>
                    <div className={s.cardTitle}>Scheduled Milestones</div>
                    {/* Filtered Calendar Events for this deal */}
                    <CalendarHighlights dealId={String(deal.id)} />

                    {deal.loan ? (() => {
                        const loan = deal.loan as { principalBalance: number; interestRate: number; maturityDate: string | Date; status: string };
                        return (
                        <div style={{ marginTop: 24, padding: 16, background: 'var(--bb-surface-2)', borderRadius: 12 }}>
                            <div style={{ fontSize: 13, textTransform: 'uppercase', fontWeight: 600, color: 'var(--bb-muted)', marginBottom: 12 }}>Live Loan Stats</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div><div style={{ fontSize: 12, color: 'var(--bb-muted)' }}>Balance</div><strong>${Number(loan.principalBalance).toLocaleString()}</strong></div>
                                <div><div style={{ fontSize: 12, color: 'var(--bb-muted)' }}>Interest</div><strong>{Number(loan.interestRate)}%</strong></div>
                                <div><div style={{ fontSize: 12, color: 'var(--bb-muted)' }}>Maturity</div><strong>{new Date(loan.maturityDate).toLocaleDateString()}</strong></div>
                                <div><div style={{ fontSize: 12, color: 'var(--bb-muted)' }}>Status</div><strong>{String(loan.status)}</strong></div>
                            </div>
                        </div>
                        );
                    })() : (
                        <div style={{ marginTop: 24 }}>
                            <FundDealAction deal={deal as Parameters<typeof FundDealAction>[0]['deal']} />
                        </div>
                    )}
                </div>
            </div>

            {/* Notes & Tasks */}
            <div className={s.grid2} style={{ marginTop: 24 }}>
                <div className={s.card}>
                    <div className={s.cardTitle}>Pipeline Notes</div>
                    <NoteTimeline entityType="Deal" entityId={String(deal.id)} />
                </div>
                <div className={s.card}>
                    <TaskList entityType="Deal" entityId={String(deal.id)} />
                </div>
            </div>

            {/* Conditions / Subject-To */}
            <ConditionsManager dealId={String(deal.id)} />

            {/* Document Requests */}
            <div className={s.card} style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div className={s.cardTitle} style={{ marginBottom: 0 }}>Deal Documents</div>
                    <Link href="/docvault" className={`${s.btn} ${s.btnSecondary} ${s.btnSmall} `}>Go to DocVault</Link>
                </div>
                {((deal.docRequests ?? []) as Array<{ id: string; docType?: string; category?: string; status: string; files?: unknown[]; notes?: string; expiresAt?: unknown }>).length === 0 ? (
                    <div className={s.emptyState}>No documents requested for this deal.</div>
                ) : (
                    <table className={s.table}>
                        <thead><tr><th>Document</th><th>Status</th><th>Files</th><th>Notes</th></tr></thead>
                        <tbody>
                            {((deal.docRequests ?? []) as Array<{ id: string; docType?: string; category?: string; status: string; files?: unknown[]; notes?: string; expiresAt?: unknown }>).map(dr => (
                                <tr key={dr.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{dr.docType ?? '—'}</div>
                                        <div style={{ fontSize: 11, color: 'var(--bb-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{dr.category ?? 'GENERAL'}</div>
                                    </td>
                                    <td>
                                        <span className={`${s.pill} ${dr.status === 'verified' ? s.pillGreen : dr.status === 'uploaded' ? s.pillBlue : dr.status === 'rejected' ? s.pillRed : s.pillYellow} `}>{dr.status}</span>
                                        {dr.expiresAt != null && <div style={{ fontSize: 11, marginTop: 4, color: new Date(dr.expiresAt as string) < new Date() ? 'var(--bb-danger)' : 'var(--bb-warning)' }}>Expires: {new Date(dr.expiresAt as string).toLocaleDateString()}</div>}
                                    </td>
                                    <td>{(dr.files?.length ?? 0) > 0 ? `${dr.files!.length} file(s)` : 'None'}</td>
                                    <td style={{ fontSize: 13, color: 'var(--bb-muted)' }}>{dr.notes ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
