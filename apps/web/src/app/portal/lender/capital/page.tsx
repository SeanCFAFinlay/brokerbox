import prisma from '@/lib/prisma';
import Link from 'next/link';
import s from '@/styles/shared.module.css';

export const dynamic = 'force-dynamic';

export default async function LenderCapitalPage() {
    // Mock authentication: pick the first active lender
    const lender = await prisma.lender.findFirst({
        where: { status: 'active' },
        include: {
            capitalPools: {
                include: { investments: { include: { user: true } } }
            }
        }
    });

    if (!lender) {
        return <div style={{ padding: 40 }}><h2>Lender Not Found</h2><Link href="/lenders">Go to Lenders</Link></div>;
    }

    const totalAvailable = lender.capitalPools.reduce((sum, p) => sum + p.availableAmount, 0);
    const totalCommitted = lender.capitalPools.reduce((sum, p) => sum + (p.totalAmount - p.availableAmount), 0);
    const aggregateUtilization = lender.capitalPools.reduce((sum, p) => sum + p.totalAmount, 0) > 0
        ? (totalCommitted / lender.capitalPools.reduce((sum, p) => sum + p.totalAmount, 0)) * 100
        : 0;

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
            <div className={s.pageHeader}>
                <div>
                    <p style={{ fontSize: 13, color: 'var(--bb-muted)', marginBottom: 4 }}>
                        <Link href="/portal/lender" style={{ color: 'var(--bb-accent)' }}>Dashboard</Link> / Capital Management
                    </p>
                    <h1>Capital & Pools</h1>
                    <p>Manage lending capacity and investor allocations for {lender.name}</p>
                </div>
            </div>

            <div className={s.kpiRow} style={{ marginBottom: 32 }}>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Total Managed Capital</div>
                    <div className={s.kpiValue}>${(totalAvailable + totalCommitted).toLocaleString()}</div>
                </div>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Available to Lend</div>
                    <div className={s.kpiValue} style={{ color: 'var(--bb-success)' }}>${totalAvailable.toLocaleString()}</div>
                </div>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Aggregate Utilization</div>
                    <div className={s.kpiValue}>{aggregateUtilization.toFixed(1)}%</div>
                </div>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Active Pools</div>
                    <div className={s.kpiValue}>{lender.capitalPools.length}</div>
                </div>
            </div>

            <div className={s.card}>
                <div className={s.cardTitle}>Managed Capital Pools</div>
                {lender.capitalPools.length === 0 ? (
                    <div className={s.emptyState}>No capital pools configured.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {lender.capitalPools.map(pool => {
                            const poolUtilization = (pool.totalAmount - pool.availableAmount) / pool.totalAmount * 100;
                            return (
                                <div key={pool.id} style={{ border: '1px solid var(--bb-border)', borderRadius: 12, padding: 24 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: 18 }}>{pool.name}</h3>
                                            <span className={`${s.pill} ${pool.status === 'active' ? s.pillGreen : s.pillGray}`} style={{ marginTop: 4 }}>{pool.status.toUpperCase()}</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 13, color: 'var(--bb-muted)' }}>Target Yield</div>
                                            <div style={{ fontSize: 18, fontWeight: 700 }}>{pool.targetYield}%</div>
                                        </div>
                                    </div>

                                    <div style={{ height: 8, background: 'var(--bb-bg-secondary)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                                        <div style={{ width: `${poolUtilization}%`, height: '100%', background: 'var(--bb-accent)' }}></div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                                        <div>
                                            <div style={{ fontSize: 12, color: 'var(--bb-muted)', textTransform: 'uppercase' }}>Total Capacity</div>
                                            <div style={{ fontWeight: 600 }}>${pool.totalAmount.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 12, color: 'var(--bb-muted)', textTransform: 'uppercase' }}>Available</div>
                                            <div style={{ fontWeight: 600 }}>${pool.availableAmount.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 12, color: 'var(--bb-muted)', textTransform: 'uppercase' }}>Min Investment</div>
                                            <div style={{ fontWeight: 600 }}>${pool.minInvestment.toLocaleString()}</div>
                                        </div>
                                    </div>

                                    <hr style={{ border: 'none', borderTop: '1px solid var(--bb-border)', margin: '20px 0' }} />

                                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Investor Allocations</div>
                                    <table className={s.table}>
                                        <thead>
                                            <tr>
                                                <th>Investor</th>
                                                <th>Amount</th>
                                                <th>Yield</th>
                                                <th>Status</th>
                                                <th>Since</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pool.investments.map(inv => (
                                                <tr key={inv.id}>
                                                    <td>{inv.user.name}</td>
                                                    <td style={{ fontWeight: 600 }}>${inv.amount.toLocaleString()}</td>
                                                    <td>{inv.yield}%</td>
                                                    <td><span className={s.pillSmall}>{inv.status}</span></td>
                                                    <td style={{ fontSize: 12, color: 'var(--bb-muted)' }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                            {pool.investments.length === 0 && (
                                                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--bb-muted)', padding: 12 }}>No investors in this pool yet.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
