import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import s from '@/styles/shared.module.css';

export const dynamic = 'force-dynamic';

export default async function LenderDashboard() {
    // Mock authentication: pick the first active lender
    const { data: lender, error } = await supabase
        .from('Lender')
        .select('*, deals:Deal(*, borrower:Borrower(*))')
        .eq('status', 'active')
        .limit(1)
        .single();

    if (error || !lender) {
        return <div style={{ padding: 40 }}><h2>No Lenders Found</h2><p>Please create a lender in the Broker CRM first.</p><Link href="/lenders">Go to Lenders</Link></div>;
    }

    const deals = lender.deals as any[] || [];
    const activeDeals = deals.filter(d => ['committed', 'in_review', 'matched'].includes(d.stage));
    const fundedDeals = deals.filter(d => d.stage === 'funded');

    const totalPipeline = activeDeals.reduce((sum, d) => sum + (d.loanAmount || 0), 0);
    const totalFunded = fundedDeals.reduce((sum, d) => sum + (d.loanAmount || 0), 0);

    const utilization = (lender.capitalAvailable || 0) > 0 ? (totalFunded / lender.capitalAvailable) * 100 : 0;

    // Manual sort
    activeDeals.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
            <div className={s.pageHeader}>
                <div>
                    <h1>Welcome, {lender.name}</h1>
                    <p>Lender Dashboard • Reviewing capital deployment and pipeline</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: 'var(--bb-muted)' }}>Capital Available</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--bb-success)' }}>${lender.capitalAvailable?.toLocaleString()}</div>
                    <Link href="/portal/lender/capital" style={{ fontSize: 13, color: 'var(--bb-accent)', textDecoration: 'none' }}>Manage Capital & Pools →</Link>
                </div>
            </div>

            <div className={s.kpiRow} style={{ marginBottom: 32 }}>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Deployed Capital (Funded)</div>
                    <div className={s.kpiValue}>${totalFunded.toLocaleString()}</div>
                </div>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Pipeline Exposure</div>
                    <div className={s.kpiValue}>${totalPipeline.toLocaleString()}</div>
                </div>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Utilization</div>
                    <div className={s.kpiValue}>{utilization.toFixed(1)}%</div>
                </div>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Active Pipeline Deals</div>
                    <div className={s.kpiValue}>{activeDeals.length}</div>
                </div>
            </div>

            <div className={s.card}>
                <div className={s.cardTitle}>Recent Deal Submissions</div>
                {activeDeals.length === 0 ? (
                    <div className={s.emptyState}>No deals currently in review or committed.</div>
                ) : (
                    <table className={s.table}>
                        <thead>
                            <tr>
                                <th>Property</th>
                                <th>Borrower</th>
                                <th>Loan Amount</th>
                                <th>Stage</th>
                                <th>LTV</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeDeals.slice(0, 5).map(d => (
                                <tr key={d.id}>
                                    <td style={{ fontWeight: 600 }}>{d.propertyAddress || 'Unnamed Deal'}</td>
                                    <td>{d.borrower?.firstName} {d.borrower?.lastName}</td>
                                    <td>${d.loanAmount?.toLocaleString()}</td>
                                    <td>
                                        <span className={`${s.pill} ${d.stage === 'committed' ? s.pillBlue : s.pillYellow}`}>
                                            {d.stage?.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td>{d.ltv ? `${d.ltv.toFixed(1)}%` : '—'}</td>
                                    <td>
                                        <Link href={`/portal/lender/deals/${d.id}`} className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`}>Review</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {activeDeals.length > 5 && (
                    <div style={{ padding: 16, textAlign: 'center' }}>
                        <Link href="/portal/lender/deals" style={{ color: 'var(--bb-accent)', fontSize: 14 }}>View All Pipeline Deals</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
