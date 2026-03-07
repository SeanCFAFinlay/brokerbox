import prisma from '@/lib/prisma';
import Link from 'next/link';
import s from '@/styles/shared.module.css';

export const dynamic = 'force-dynamic';

export default async function FundFlowPage() {
    const lenders = await prisma.lender.findMany({
        where: { status: 'active' },
        orderBy: { name: 'asc' },
    });

    const activeDeals = await prisma.deal.findMany({
        where: { stage: { in: ['in_review', 'matched', 'committed', 'funded'] } },
        include: { borrower: true, lender: true },
        orderBy: { closingDate: 'asc' },
    });

    // Lender Capital Stats
    const totalAvailable = lenders.reduce((sum, l) => sum + l.capitalAvailable, 0);
    const totalCommitted = lenders.reduce((sum, l) => sum + l.capitalCommitted, 0);

    // Deal Stats
    const fundedYTD = activeDeals.filter(d => d.stage === 'funded' && d.fundingDate && new Date(d.fundingDate).getFullYear() === new Date().getFullYear()).reduce((sum, d) => sum + d.loanAmount, 0);
    const committedPipeline = activeDeals.filter(d => d.stage === 'committed').reduce((sum, d) => sum + d.loanAmount, 0);

    // Upcoming Closings (Next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const upcomingClosings = activeDeals.filter(d => d.stage !== 'funded' && d.closingDate && new Date(d.closingDate) <= thirtyDaysFromNow && new Date(d.closingDate) >= new Date());

    return (
        <>
            <div className={s.pageHeader}>
                <h1>💸 FundFlow Tracker</h1>
                <p>Track capital allocation, lender dry powder, and upcoming funding requirements</p>
            </div>

            <div className={s.kpiRow} style={{ marginBottom: 24, gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Total Dry Powder</div>
                    <div className={s.kpiValue} style={{ color: 'var(--bb-success)' }}>${(totalAvailable / 1e6).toFixed(1)}M</div>
                </div>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Capital Committed</div>
                    <div className={s.kpiValue}>${(totalCommitted / 1e6).toFixed(1)}M</div>
                </div>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Pipeline Committed</div>
                    <div className={s.kpiValue}>${(committedPipeline / 1e6).toFixed(1)}M</div>
                </div>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Funded YTD</div>
                    <div className={s.kpiValue} style={{ color: 'var(--bb-accent)' }}>${(fundedYTD / 1e6).toFixed(1)}M</div>
                </div>
            </div>

            <div className={s.grid2}>
                <div className={s.card}>
                    <div className={s.cardTitle}>Lender Capital Positions</div>
                    <table className={s.table}>
                        <thead>
                            <tr><th>Lender</th><th>Available</th><th>Committed</th><th>Utilization</th></tr>
                        </thead>
                        <tbody>
                            {lenders.map(l => {
                                const utilization = l.capitalAvailable + l.capitalCommitted > 0
                                    ? (l.capitalCommitted / (l.capitalAvailable + l.capitalCommitted)) * 100
                                    : 0;
                                return (
                                    <tr key={l.id}>
                                        <td><Link href={`/lenders/${l.id}`} style={{ fontWeight: 600, color: 'var(--bb-accent)' }}>{l.name}</Link></td>
                                        <td>${(l.capitalAvailable / 1e6).toFixed(1)}M</td>
                                        <td>${(l.capitalCommitted / 1e6).toFixed(1)}M</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ flex: 1, backgroundColor: 'var(--bb-border)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                                                    <div style={{ width: `${Math.min(utilization, 100)}%`, backgroundColor: utilization > 80 ? 'var(--bb-danger)' : utilization > 50 ? 'var(--bb-yellow)' : 'var(--bb-success)', height: '100%' }} />
                                                </div>
                                                <span style={{ fontSize: 12, color: 'var(--bb-muted)', width: 30 }}>{utilization.toFixed(0)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className={s.card}>
                    <div className={s.cardTitle}>Upcoming Closings (Next 30 Days)</div>
                    {upcomingClosings.length === 0 ? (
                        <div className={s.emptyState}>No imminent closings scheduled.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {upcomingClosings.map(d => (
                                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--bb-border)', borderRadius: 8, backgroundColor: 'var(--bb-bg)' }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}><Link href={`/deals/${d.id}`} style={{ color: 'var(--bb-text)' }}>{d.borrower.firstName} {d.borrower.lastName}</Link></div>
                                        <div style={{ fontSize: 13, color: 'var(--bb-muted)', marginTop: 4 }}>
                                            {d.lender ? <span style={{ color: 'var(--bb-accent)' }}>{d.lender.name}</span> : 'Unassigned Lender'} • {d.position} Mortgage
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, fontSize: 16 }}>${d.loanAmount.toLocaleString()}</div>
                                        <div style={{ fontSize: 12, color: 'var(--bb-danger)', fontWeight: 600, marginTop: 4 }}>{new Date(d.closingDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={s.cardTitle} style={{ marginTop: 32 }}>Recently Funded</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {activeDeals.filter(d => d.stage === 'funded').slice(0, 5).map(d => (
                            <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--bb-border)', borderRadius: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}><Link href={`/deals/${d.id}`} style={{ color: 'var(--bb-text)' }}>{d.borrower.firstName} {d.borrower.lastName}</Link></div>
                                    <div style={{ fontSize: 13, color: 'var(--bb-muted)', marginTop: 4 }}>
                                        {d.lender?.name || 'Unknown Lender'}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--bb-success)' }}>${d.loanAmount.toLocaleString()}</div>
                                    {d.fundingDate && <div style={{ fontSize: 12, color: 'var(--bb-muted)', marginTop: 4 }}>{new Date(d.fundingDate).toLocaleDateString()}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
