import prisma from '@/lib/prisma';
import Link from 'next/link';
import s from '@/styles/shared.module.css';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LenderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const lender = await prisma.lender.findUnique({
        where: { id },
        include: { deals: { include: { borrower: true }, orderBy: { updatedAt: 'desc' } } },
    });

    if (!lender) return notFound();

    return (
        <>
            <div className={s.pageHeader}>
                <p style={{ fontSize: 13, color: 'var(--bb-muted)', marginBottom: 4 }}><Link href="/lenders" style={{ color: 'var(--bb-accent)' }}>Lenders</Link> / {lender.name}</p>
                <h1>{lender.name}</h1>
            </div>

            <div className={s.kpiRow} style={{ marginBottom: 24 }}>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Min Credit</div><div className={s.kpiValue}>{lender.minCreditScore}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Max LTV</div><div className={s.kpiValue}>{lender.maxLTV}%</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Max GDS</div><div className={s.kpiValue}>{lender.maxGDS}%</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Max TDS</div><div className={s.kpiValue}>{lender.maxTDS}%</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Base Rate</div><div className={s.kpiValue}>{lender.baseRate}%</div></div>
            </div>

            <div className={s.grid2}>
                <div className={s.card}>
                    <div className={s.cardTitle}>Eligibility Matrix</div>
                    <div style={{ fontSize: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div><strong>Provinces:</strong> {lender.supportedProvinces.join(', ')}</div>
                        <div><strong>Property Types:</strong> {lender.propertyTypes.join(', ')}</div>
                        <div><strong>Speed Rating:</strong> {lender.speed}/10</div>
                        <div><strong>Exceptions Tolerance:</strong> {lender.exceptionsTolerance}/10</div>
                        <div><strong>Appetite:</strong> {lender.appetite}/10</div>
                        <div><strong>Pricing Premium:</strong> {lender.pricingPremium}%</div>
                    </div>
                </div>
                <div className={s.card}>
                    <div className={s.cardTitle}>Document Requirements</div>
                    {lender.documentRequirements.length === 0 ? (
                        <div className={s.emptyState}>No specific requirements listed.</div>
                    ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {lender.documentRequirements.map((d, i) => <span key={i} className={`${s.pill} ${s.pillBlue}`}>{d}</span>)}
                        </div>
                    )}
                </div>
            </div>

            <div className={s.card} style={{ marginTop: 24 }}>
                <div className={s.cardTitle}>Deals ({lender.deals.length})</div>
                {lender.deals.length === 0 ? (
                    <div className={s.emptyState}>No deals with this lender yet.</div>
                ) : (
                    <table className={s.table}>
                        <thead><tr><th>Borrower</th><th>Property</th><th>Loan</th><th>Stage</th></tr></thead>
                        <tbody>
                            {lender.deals.map(d => (
                                <tr key={d.id}>
                                    <td><Link href={`/borrowers/${d.borrowerId}`} style={{ color: 'var(--bb-accent)' }}>{d.borrower.firstName} {d.borrower.lastName}</Link></td>
                                    <td>{d.propertyAddress || '—'}</td>
                                    <td>${d.loanAmount.toLocaleString()}</td>
                                    <td><span className={`${s.pill} ${d.stage === 'funded' ? s.pillGreen : s.pillGray}`}>{d.stage}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
