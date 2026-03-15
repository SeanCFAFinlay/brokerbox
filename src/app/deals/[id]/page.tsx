import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import s from '@/styles/shared.module.css';
import { notFound } from 'next/navigation';
import { runMatch, dealStallRisk, documentCompleteness, getNextBestActions } from '@/lib/domain';
import DealEditForm from './DealEditForm';
import NoteTimeline from '@/components/NoteTimeline';
import TaskList from '@/components/TaskList';
import ConditionsManager from './ConditionsManager';
import FundDealAction from './FundDealAction';
import ApplyMatchButton from './ApplyMatchButton';
import AuditTimeline from '@/components/AuditTimeline';
import CalendarHighlights from '@/components/CalendarHighlights';

export const dynamic = 'force-dynamic';

const stageColor = (stage: string) =>
    stage === 'funded' ? s.pillGreen
        : stage === 'committed' ? s.pillBlue
            : stage === 'matched' ? s.pillYellow
                : stage === 'declined' || stage === 'archived' ? s.pillRed
                    : s.pillGray;

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data: deal, error: dealError } = await supabase
        .from('Deal')
        .select('*, borrower:Borrower(*), lender:Lender(*), conditions:DealCondition(*), docRequests:DocRequest(*, files:DocumentFile(*)), stageHistory:DealStageHistory(*), scenarios:Scenario(*), tasks:Task(*), loan:Loan(*, payments:LoanPayment(*), fees:LoanFee(*))')
        .eq('id', id)
        .single();

    if (dealError || !deal) return notFound();

    const { data: allLendersData } = await supabase.from('Lender').select('id, name').eq('status', 'active');
    const allLenders = allLendersData || [];

    // Run match engine for top 3
    const { data: rawLendersData } = await supabase.from('Lender').select('*').eq('status', 'active');
    const rawLenders = rawLendersData || [];

    const borrowerData = {
        creditScore: deal.borrower?.creditScore || 0,
        income: deal.borrower?.income || 0,
        province: deal.borrower?.province || '',
        city: deal.borrower?.city || '',
        liabilities: deal.borrower?.liabilities || 0,
    };
    const dealData = {
        propertyValue: deal.propertyValue,
        loanAmount: deal.loanAmount,
        propertyType: deal.propertyType,
        ltv: deal.ltv || 0,
        gds: deal.gds || 0,
        tds: deal.tds || 0,
        position: deal.position,
        loanPurpose: deal.loanPurpose,
        termMonths: deal.termMonths
    };
    const lenders = rawLenders.map(l => ({
        ...l, 
        pricingPremium: l.pricingPremium,
        documentRequirements: l.documentRequirements,
        allowsSelfEmployed: (l as any).allowsSelfEmployed ?? true,
        ruralMaxLTV: (l as any).ruralMaxLTV ?? l.maxLTV,
    }));
    const matchResults = runMatch(borrowerData, dealData, lenders as any).slice(0, 3);

    // Manual sort for nested results
    if (deal.docRequests) deal.docRequests.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (deal.stageHistory) deal.stageHistory.sort((a: any, b: any) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
    if (deal.scenarios) deal.scenarios.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (deal.tasks) deal.tasks.sort((a: any, b: any) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    const stall = dealStallRisk(
        { id: deal.id, stage: deal.stage, updatedAt: deal.updatedAt, createdAt: deal.createdAt, fundingDate: deal.fundingDate, closingDate: deal.closingDate, priority: deal.priority },
        deal.tasks.map((t: any) => ({ id: t.id, dueDate: t.dueDate, status: t.status, dealId: t.dealId })),
        deal.conditions?.map((c: any) => ({ id: c.id, status: c.status })) ?? [],
        deal.docRequests.map((d: any) => ({ id: d.id, status: d.status, createdAt: d.createdAt, expiresAt: d.expiresAt }))
    );
    const docStats = documentCompleteness(
        deal.docRequests.map((d: any) => ({ id: d.id, status: d.status, createdAt: d.createdAt, expiresAt: d.expiresAt }))
    );
    const nbaForDeal = getNextBestActions(
        [{ id: deal.borrower.id, updatedAt: deal.borrower.updatedAt }],
        [{ id: deal.id, borrowerId: deal.borrowerId, stage: deal.stage, updatedAt: deal.updatedAt }],
        deal.tasks.map((t: any) => ({ id: t.id, dueDate: t.dueDate, status: t.status, dealId: t.dealId, entityType: t.entityType, entityId: t.entityId })),
        deal.docRequests.map((d: any) => ({ id: d.id, borrowerId: deal.borrowerId, dealId: deal.id, status: d.status, createdAt: d.createdAt }))
    ).filter((a) => a.entityId === id).slice(0, 4);

    return (
        <>
            <div className={s.pageHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontSize: 13, color: 'var(--bb-muted)', marginBottom: 4 }}>
                            <Link href="/deals" style={{ color: 'var(--bb-accent)' }}>Deal Desk</Link> /
                            <Link href={`/borrowers/${deal.borrowerId}`} style={{ color: 'var(--bb-accent)', marginLeft: 4 }}>{deal.borrower?.firstName} {deal.borrower?.lastName}</Link>
                        </p>
                        <h1>{deal.propertyAddress ? deal.propertyAddress : `Deal #${deal.id.slice(-6)}`}</h1>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {stall.label !== 'low' && (
                            <span className={`${s.pill} ${stall.label === 'high' ? s.pillRed : s.pillYellow}`} title={stall.reasons.join(' · ')}>
                                Risk: {stall.label}
                            </span>
                        )}
                        <span className={`${s.pill} ${deal.priority === 'urgent' ? s.pillRed : deal.priority === 'high' ? s.pillYellow : s.pillGray}`}>{deal.priority}</span>
                        <span className={`${s.pill} ${stageColor(deal.stage)}`}>{deal.stage.replace('_', ' ').toUpperCase()}</span>
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
                <div className={s.kpiCard}><div className={s.kpiLabel}>Loan Amount</div><div className={s.kpiValue}>${deal.loanAmount?.toLocaleString()}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Property Value</div><div className={s.kpiValue}>${deal.propertyValue?.toLocaleString()}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>LTV</div><div className={s.kpiValue}>{deal.ltv ? `${deal.ltv.toFixed(1)}% ` : '—'}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Position</div><div className={s.kpiValue}>{deal.position}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Lender</div><div className={s.kpiValue} style={{ fontSize: 18 }}>{deal.lender?.name || 'Unassigned'}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Docs</div><div className={s.kpiValue} title={`${docStats.verified}/${docStats.requested} verified`}>{docStats.requested ? `${docStats.pctComplete}%` : '—'}</div></div>
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
                        agentCommissionSplit: deal.agentCommissionSplit,
                        totalRevenue: deal.totalRevenue,
                        netBrokerageRevenue: deal.netBrokerageRevenue,
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
                                <div className={`${s.scoreCircle} ${r.score >= 70 ? s.scoreHigh : r.score >= 40 ? s.scoreMed : s.scoreLow} `} style={{ width: 36, height: 36, fontSize: 14 }}>
                                    {r.score}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--bb-text)' }}>
                                            <Link href={`/lenders/${r.lenderId}`} style={{ color: 'inherit', textDecoration: 'none' }}>{r.lenderName}</Link>
                                        </div>
                                        {deal.lenderId !== r.lenderId && (
                                            <ApplyMatchButton dealId={deal.id} borrowerId={deal.borrowerId} lenderId={r.lenderId} />
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
                    {deal.borrower ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                            <div><strong style={{ display: 'inline-block', width: 120 }}>Primary:</strong> {deal.borrower.firstName} {deal.borrower.lastName}</div>
                            <div><strong style={{ display: 'inline-block', width: 120 }}>Email:</strong> {deal.borrower.email}</div>
                            <div><strong style={{ display: 'inline-block', width: 120 }}>Phone:</strong> {deal.borrower.phone}</div>
                            <div><strong style={{ display: 'inline-block', width: 120 }}>Income:</strong> ${deal.borrower.income?.toLocaleString()} ({deal.borrower.borrowerType || 'employed'})</div>
                            <div><strong style={{ display: 'inline-block', width: 120 }}>Credit Score:</strong> <span className={`${s.pill} ${deal.borrower.creditScore >= 700 ? s.pillGreen : deal.borrower.creditScore >= 600 ? s.pillYellow : s.pillRed} `}>{deal.borrower.creditScore}</span></div>
                            {deal.borrower.coBorrowerName && (
                                <div><strong style={{ display: 'inline-block', width: 120 }}>Co-Borrower:</strong> {deal.borrower.coBorrowerName}</div>
                            )}
                            <Link href={`/borrowers/${deal.borrowerId}`} className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`} style={{ alignSelf: 'flex-start', marginTop: 8 }}>View Full Profile</Link>
                        </div>
                    ) : (
                        <div className={s.emptyState}>No borrower linked.</div>
                    )}
                </div>
            </div>

            {/* Scenarios */}
            <div className={s.card} style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div className={s.cardTitle} style={{ marginBottom: 0 }}>Saved Scenarios</div>
                    <Link href="/scenarios" className={`${s.btn} ${s.btnSecondary} ${s.btnSmall} `}>+ Scenario Builder</Link>
                </div>
                {deal.scenarios.length === 0 ? (
                    <div className={s.emptyState}>No scenarios linked to this deal.</div>
                ) : (
                    <table className={s.table}>
                        <thead><tr><th>Lender</th><th>Rate</th><th>Term</th><th>Monthly Payment</th><th>Rec</th></tr></thead>
                        <tbody>
                            {deal.scenarios.map((sc: any) => {
                                const r = sc.results as Record<string, number>;
                                const i = sc.inputs as Record<string, any>;
                                return (
                                    <tr key={sc.id}>
                                        <td style={{ fontWeight: 600 }}>{i.lenderName || sc.name}</td>
                                        <td>{r.rate?.toFixed(2) || '0.00'}%</td>
                                        <td>{r.termMonths || 0} mos</td>
                                        <td>${(r.monthlyPayment || 0).toLocaleString()}</td>
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
                    <AuditTimeline entityType="Deal" entityId={deal.id} />

                    <div style={{ marginTop: 24 }}>
                        <div style={{ fontSize: 13, textTransform: 'uppercase', fontWeight: 600, color: 'var(--bb-muted)', marginBottom: 12 }}>Stage Transitions</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {deal.stageHistory.map((h: any) => (
                                <div key={h.id} style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13, color: 'var(--bb-text-secondary)' }}>
                                    <span className={`${s.pill} ${stageColor(h.fromStage)}`} style={{ fontSize: 11 }}>{h.fromStage?.replace('_', ' ')}</span>
                                    <span>→</span>
                                    <span className={`${s.pill} ${stageColor(h.toStage)}`} style={{ fontSize: 11 }}>{h.toStage?.replace('_', ' ')}</span>
                                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--bb-muted)' }}>{new Date(h.changedAt).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={s.card}>
                    <div className={s.cardTitle}>Scheduled Milestones</div>
                    <CalendarHighlights dealId={deal.id} />

                    {deal.loan ? (
                        <div style={{ marginTop: 24, padding: 16, background: 'var(--bb-surface-2)', borderRadius: 12 }}>
                            <div style={{ fontSize: 13, textTransform: 'uppercase', fontWeight: 600, color: 'var(--bb-muted)', marginBottom: 12 }}>Live Loan Stats</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div><div style={{ fontSize: 12, color: 'var(--bb-muted)' }}>Balance</div><strong>${deal.loan.principalBalance?.toLocaleString()}</strong></div>
                                <div><div style={{ fontSize: 12, color: 'var(--bb-muted)' }}>Interest</div><strong>{deal.loan.interestRate}%</strong></div>
                                <div><div style={{ fontSize: 12, color: 'var(--bb-muted)' }}>Maturity</div><strong>{deal.loan.maturityDate ? new Date(deal.loan.maturityDate).toLocaleDateString() : '—'}</strong></div>
                                <div><div style={{ fontSize: 12, color: 'var(--bb-muted)' }}>Status</div><strong>{deal.loan.status}</strong></div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ marginTop: 24 }}>
                            <FundDealAction deal={deal} />
                        </div>
                    )}
                </div>
            </div>

            {/* Notes & Tasks */}
            <div className={s.grid2} style={{ marginTop: 24 }}>
                <div className={s.card}>
                    <div className={s.cardTitle}>Pipeline Notes</div>
                    <NoteTimeline entityType="Deal" entityId={deal.id} />
                </div>
                <div className={s.card}>
                    <TaskList entityType="Deal" entityId={deal.id} />
                </div>
            </div>

            {/* Conditions / Subject-To */}
            <ConditionsManager dealId={deal.id} />

            {/* Document Requests */}
            <div className={s.card} style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div className={s.cardTitle} style={{ marginBottom: 0 }}>Deal Documents</div>
                    <Link href="/docvault" className={`${s.btn} ${s.btnSecondary} ${s.btnSmall} `}>Go to DocVault</Link>
                </div>
                {deal.docRequests.length === 0 ? (
                    <div className={s.emptyState}>No documents requested for this deal.</div>
                ) : (
                    <table className={s.table}>
                        <thead><tr><th>Document</th><th>Status</th><th>Files</th><th>Notes</th></tr></thead>
                        <tbody>
                            {deal.docRequests.map((dr: any) => (
                                <tr key={dr.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{dr.docType}</div>
                                        <div style={{ fontSize: 11, color: 'var(--bb-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{dr.category || 'GENERAL'}</div>
                                    </td>
                                    <td>
                                        <span className={`${s.pill} ${dr.status === 'verified' ? s.pillGreen : dr.status === 'uploaded' ? s.pillBlue : dr.status === 'rejected' ? s.pillRed : s.pillYellow} `}>{dr.status}</span>
                                        {dr.expiresAt && <div style={{ fontSize: 11, marginTop: 4, color: new Date(dr.expiresAt) < new Date() ? 'var(--bb-danger)' : 'var(--bb-warning)' }}>Expires: {new Date(dr.expiresAt).toLocaleDateString()}</div>}
                                    </td>
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
