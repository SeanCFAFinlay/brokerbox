import prisma from '@/lib/prisma';
import Link from 'next/link';
import s from '@/styles/shared.module.css';
import { notFound } from 'next/navigation';

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

    const activeDeals = lender.deals.filter(d => d.stage !== 'closed' && d.stage !== 'funded');
    const fundedDeals = lender.deals.filter(d => d.stage === 'funded');
    const totalFunded = fundedDeals.reduce((sum, d) => sum + d.loanAmount, 0);

    return (
        <>
            <div className={s.pageHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontSize: 13, color: 'var(--bb-muted)', marginBottom: 4 }}><Link href="/lenders" style={{ color: 'var(--bb-accent)' }}>Lenders</Link> / {lender.name}</p>
                        <h1>{lender.name}</h1>
                    </div>
                    <span className={`${s.pill} ${lender.status === 'active' ? s.pillGreen : s.pillGray}`}>{lender.status}</span>
                </div>
            </div>

            {/* Lender Stats */}
            <div className={s.kpiRow} style={{ marginBottom: 24 }}>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Base Rate</div><div className={s.kpiValue} style={{ color: 'var(--bb-accent)' }}>{lender.baseRate}%</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Active Pipeline</div><div className={s.kpiValue}>{activeDeals.length} deals</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Total Funded</div><div className={s.kpiValue}>${(totalFunded / 1e6).toFixed(2)}M</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Appetite Score</div><div className={s.kpiValue}>{lender.appetite}/10</div></div>
            </div>

            <div className={s.grid2}>
                {/* Eligibility Matrix */}
                <div className={s.card}>
                    <div className={s.cardTitle}>Eligibility Matrix</div>
                    <table className={s.table}>
                        <tbody>
                            <tr><td style={{ fontWeight: 600, width: '40%' }}>Min Credit Score</td><td>{lender.minCreditScore}</td></tr>
                            <tr><td style={{ fontWeight: 600 }}>Max LTV</td><td>{lender.maxLTV}%</td></tr>
                            <tr><td style={{ fontWeight: 600 }}>Max GDS / TDS</td><td>{lender.maxGDS}% / {lender.maxTDS}%</td></tr>
                            <tr><td style={{ fontWeight: 600 }}>Supported Provinces</td><td>{lender.supportedProvinces.join(', ')}</td></tr>
                            <tr><td style={{ fontWeight: 600 }}>Property Types</td><td style={{ textTransform: 'capitalize' }}>{lender.propertyTypes.join(', ')}</td></tr>
                        </tbody>
                    </table>
                </div>

                {/* Score & Profile */}
                <div className={s.card}>
                    <div className={s.cardTitle}>Lender Profile</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--bb-muted)' }}>Speed to Fund:</span>
                            <span>{lender.speed}/10</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--bb-muted)' }}>Exceptions Tolerance:</span>
                            <span>{lender.exceptionsTolerance}/10</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--bb-muted)' }}>Pricing Premium:</span>
                            <span>+{lender.pricingPremium}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--bb-muted)' }}>Contact Email:</span>
                            <span>{lender.contactEmail || '—'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--bb-muted)' }}>Contact Phone:</span>
                            <span>{lender.contactPhone || '—'}</span>
                        </div>
                    </div>
                </div>
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
                                    <td><Link href={`/deals/${d.id}`} style={{ color: 'var(--bb-text)', fontWeight: 600 }}>{d.borrower.firstName} {d.borrower.lastName}</Link></td>
                                    <td>${d.loanAmount.toLocaleString()}</td>
                                    <td>{d.ltv ? `${d.ltv.toFixed(1)}%` : '—'}</td>
                                    <td><span className={`${s.pill} ${d.stage === 'funded' ? s.pillGreen : d.stage === 'approved' ? s.pillBlue : s.pillGray}`}>{d.stage}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
