import prisma from '@/lib/prisma';
import Link from 'next/link';
import s from '@/styles/shared.module.css';
import { notFound } from 'next/navigation';
import LenderEditForm from './LenderEditForm';
import NoteTimeline from '@/components/NoteTimeline';

export const dynamic = 'force-dynamic';

export default async function LenderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const lender = await prisma.lender.findUnique({
        where: { id },
        include: {
            deals: { include: { borrower: true }, orderBy: { updatedAt: 'desc' } },
        },
    });

    if (!lender) return notFound();

    const activeDeals = lender.deals.filter(d => d.stage !== 'declined' && d.stage !== 'archived' && d.stage !== 'funded');
    const fundedDeals = lender.deals.filter(d => d.stage === 'funded');
    const totalFunded = fundedDeals.reduce((sum, d) => sum + d.loanAmount, 0);
    const activePipeline = activeDeals.reduce((sum, d) => sum + d.loanAmount, 0);

    return (
        <>
            <div className={s.pageHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontSize: 13, color: 'var(--bb-muted)', marginBottom: 4 }}>
                            <Link href="/lenders" style={{ color: 'var(--bb-accent)' }}>Lenders</Link> / {lender.name}
                        </p>
                        <h1>{lender.name}</h1>
                    </div>
                    <span className={`${s.pill} ${lender.status === 'active' ? s.pillGreen : s.pillGray}`}>
                        {lender.status.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Lender Stats */}
            <div className={s.kpiRow} style={{ marginBottom: 24 }}>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Available Capital</div><div className={s.kpiValue} style={{ color: 'var(--bb-accent)' }}>${(lender.capitalAvailable / 1e6).toFixed(1)}M</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Active Pipeline</div><div className={s.kpiValue}>${(activePipeline / 1e6).toFixed(1)}M</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Total Funded</div><div className={s.kpiValue}>${(totalFunded / 1e6).toFixed(1)}M</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Active Deals</div><div className={s.kpiValue}>{activeDeals.length}</div></div>
            </div>

            {/* Underwriting box */}
            <div className={s.card} style={{ marginBottom: 24 }}>
                <div className={s.cardTitle} style={{ marginBottom: 12 }}>Underwriting box</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, fontSize: 14 }}>
                    <div><span style={{ color: 'var(--bb-muted)', display: 'block', fontSize: 11, textTransform: 'uppercase' }}>Min credit</span><strong>{lender.minCreditScore ?? '—'}</strong></div>
                    <div><span style={{ color: 'var(--bb-muted)', display: 'block', fontSize: 11, textTransform: 'uppercase' }}>Max LTV</span><strong>{lender.maxLTV != null ? `${lender.maxLTV}%` : '—'}</strong></div>
                    <div><span style={{ color: 'var(--bb-muted)', display: 'block', fontSize: 11, textTransform: 'uppercase' }}>Max GDS</span><strong>{lender.maxGDS != null ? `${lender.maxGDS}%` : '—'}</strong></div>
                    <div><span style={{ color: 'var(--bb-muted)', display: 'block', fontSize: 11, textTransform: 'uppercase' }}>Max TDS</span><strong>{lender.maxTDS != null ? `${lender.maxTDS}%` : '—'}</strong></div>
                    <div><span style={{ color: 'var(--bb-muted)', display: 'block', fontSize: 11, textTransform: 'uppercase' }}>Loan range</span><strong>{lender.minLoan != null && lender.maxLoan != null ? `$${(lender.minLoan / 1000).toFixed(0)}k–$${(lender.maxLoan / 1e6).toFixed(1)}M` : '—'}</strong></div>
                    <div><span style={{ color: 'var(--bb-muted)', display: 'block', fontSize: 11, textTransform: 'uppercase' }}>Provinces</span><strong>{(lender.supportedProvinces as string[] | null)?.length ? (lender.supportedProvinces as string[]).join(', ') : 'All'}</strong></div>
                    <div><span style={{ color: 'var(--bb-muted)', display: 'block', fontSize: 11, textTransform: 'uppercase' }}>Property types</span><strong>{(lender.propertyTypes as string[] | null)?.length ? (lender.propertyTypes as string[]).join(', ') : '—'}</strong></div>
                </div>
            </div>

            {/* Lender Edit Form */}
            <LenderEditForm lender={{
                id: lender.id,
                name: lender.name,
                contactEmail: lender.contactEmail,
                contactPhone: lender.contactPhone,
                contactName: lender.contactName,
                minCreditScore: lender.minCreditScore,
                maxLTV: lender.maxLTV,
                maxGDS: lender.maxGDS,
                maxTDS: lender.maxTDS,
                supportedProvinces: lender.supportedProvinces,
                propertyTypes: lender.propertyTypes,
                positionTypes: lender.positionTypes,
                productCategories: lender.productCategories,
                minLoan: lender.minLoan,
                maxLoan: lender.maxLoan,
                termMin: lender.termMin,
                termMax: lender.termMax,
                pricingPremium: lender.pricingPremium,
                baseRate: lender.baseRate,
                lenderFees: lender.lenderFees,
                speed: lender.speed,
                exceptionsTolerance: lender.exceptionsTolerance,
                appetite: lender.appetite,
                capitalAvailable: lender.capitalAvailable,
                capitalCommitted: lender.capitalCommitted,
                notes: lender.notes,
                underwritingNotes: lender.underwritingNotes,
                status: lender.status,
            }} />

            {/* Note Timeline */}
            <div style={{ marginTop: 24 }}>
                <NoteTimeline entityType="Lender" entityId={lender.id} />
            </div>

            {/* Associated Deals */}
            <div className={s.card} style={{ marginTop: 24 }}>
                <div className={s.cardTitle}>Deals Submitted to {lender.name}</div>
                {lender.deals.length === 0 ? (
                    <div className={s.emptyState}>No deals submitted yet.</div>
                ) : (
                    <table className={s.table}>
                        <thead><tr><th>Borrower</th><th>Loan</th><th>LTV</th><th>Stage</th></tr></thead>
                        <tbody>
                            {lender.deals.map(d => (
                                <tr key={d.id}>
                                    <td><Link href={`/deals/${d.id}`} style={{ color: 'var(--bb-accent)', fontWeight: 600 }}>{d.borrower.firstName} {d.borrower.lastName}</Link></td>
                                    <td>${d.loanAmount.toLocaleString()}</td>
                                    <td>{d.ltv ? `${d.ltv.toFixed(1)}%` : '—'}</td>
                                    <td><span className={`${s.pill} ${d.stage === 'funded' ? s.pillGreen : d.stage === 'committed' ? s.pillBlue : s.pillGray}`}>{d.stage}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
