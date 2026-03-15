import { supabase } from '@/lib/supabase';
import s from '@/styles/shared.module.css';
import Link from 'next/link';
import { pipelineVolume, fundedVolume, closeRate, avgDaysToFund } from '@/lib/domain';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    const [
        { data: dealsData },
        { data: lendersData },
        { data: borrowersData }
    ] = await Promise.all([
        supabase.from('Deal').select('*, borrower:Borrower(*), lender:Lender(*)'),
        supabase.from('Lender').select('*'),
        supabase.from('Borrower').select('*')
    ]);

    const deals = Array.isArray(dealsData) ? dealsData : [];
    const lenders = Array.isArray(lendersData) ? lendersData : [];
    const borrowers = Array.isArray(borrowersData) ? borrowersData : [];

    const dealDtos = deals.map((d: any) => ({
        id: d.id,
        stage: d.stage,
        loanAmount: d.loanAmount,
        createdAt: d.createdAt,
        fundingDate: d.fundingDate,
        totalRevenue: d.totalRevenue,
        netBrokerageRevenue: d.netBrokerageRevenue,
        brokerFee: d.brokerFee,
    }));
    const totalPipeline = pipelineVolume(dealDtos);
    const totalFundedVol = fundedVolume(dealDtos);
    const closeRatePct = closeRate(dealDtos);
    const avgDays = avgDaysToFund(dealDtos);
    const funded = deals.filter((d: any) => d.stage === 'funded');
    const active = deals.filter((d: any) => ['intake', 'in_review', 'matched', 'committed'].includes(d.stage));

    // Volume by month (last 6 months)
    const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return {
            label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
            year: d.getFullYear(),
            month: d.getMonth()
        };
    }).reverse();

    const monthlyVolume = months.map(m => {
        const monthDeals = funded.filter((d: any) => {
            const fd = new Date(d.fundingDate || d.updatedAt);
            return fd.getFullYear() === m.year && fd.getMonth() === m.month;
        });
        return {
            label: m.label,
            volume: monthDeals.reduce((sum: number, d: any) => sum + (d.loanAmount || 0), 0),
            count: monthDeals.length
        };
    });

    // LTV Distribution
    const ltvTiers = [
        { label: '< 50%', min: 0, max: 50 },
        { label: '50-65%', min: 50, max: 65 },
        { label: '65-75%', min: 65, max: 75 },
        { label: '75-80%', min: 75, max: 80 },
        { label: '> 80%', min: 80, max: 100 }
    ];

    const ltvDist = ltvTiers.map(tier => {
        const tierDeals = deals.filter((d: any) => d.ltv && d.ltv > tier.min && d.ltv <= tier.max);
        return { ...tier, count: tierDeals.length, volume: tierDeals.reduce((sum: number, d: any) => sum + (d.loanAmount || 0), 0) };
    });

    // Lender Performance
    const lenderStats = lenders.map((l: any) => {
        const lDeals = funded.filter((d: any) => d.lenderId === l.id);
        const lPipeline = active.filter((d: any) => d.lenderId === l.id);
        return {
            name: l.name,
            fundedCount: lDeals.length,
            fundedVolume: lDeals.reduce((sum: number, d: any) => sum + (d.loanAmount || 0), 0),
            pipelineVolume: lPipeline.reduce((sum: number, d: any) => sum + (d.loanAmount || 0), 0)
        };
    }).sort((a: any, b: any) => b.fundedVolume - a.fundedVolume);

    return (
        <div style={{ padding: '40px' }}>
            <div className={s.pageHeader}>
                <div>
                    <h1>Executive Reports & Insights</h1>
                    <p>Performance tracking, pipeline aging, and portfolio distribution</p>
                </div>
            </div>

            <div className={s.kpiRow} style={{ marginBottom: 24 }}>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Pipeline volume</div><div className={s.kpiValue}>${(totalPipeline / 1e6).toFixed(1)}M</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Funded volume</div><div className={s.kpiValue}>${(totalFundedVol / 1e6).toFixed(1)}M</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Close rate</div><div className={s.kpiValue}>{closeRatePct != null ? `${closeRatePct}%` : '—'}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Avg days to fund</div><div className={s.kpiValue}>{avgDays != null ? `${avgDays}d` : '—'}</div></div>
            </div>

            <div className={s.card} style={{ marginBottom: 24 }}>
                <div className={s.cardTitle}>Funded Volume (Last 6 Months)</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, height: 200, padding: '20px 0' }}>
                    {monthlyVolume.map(mv => {
                        const maxVol = Math.max(...monthlyVolume.map(v => v.volume), 1);
                        const height = (mv.volume / maxVol) * 100;
                        return (
                            <div key={mv.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontSize: 11, color: 'var(--bb-muted)', marginBottom: 4 }}>${(mv.volume / 1000).toFixed(0)}k</div>
                                <div style={{ width: '100%', height: `${height}%`, background: 'var(--bb-accent)', borderRadius: '4px 4px 0 0', minHeight: 4 }}></div>
                                <div style={{ fontSize: 12, marginTop: 8, fontWeight: 500 }}>{mv.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className={s.grid2}>
                <div className={s.card}>
                    <div className={s.cardTitle}>LTV Distribution</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {ltvDist.map(tier => {
                            const maxDist = Math.max(...ltvDist.map(d => d.count), 1);
                            const width = (tier.count / maxDist) * 100;
                            return (
                                <div key={tier.label}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                                        <span>{tier.label}</span>
                                        <span>{tier.count} deals (${(tier.volume / 1e6).toFixed(1)}M)</span>
                                    </div>
                                    <div style={{ height: 6, background: 'var(--bb-bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{ width: `${width}%`, height: '100%', background: 'var(--bb-success)' }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={s.card}>
                    <div className={s.cardTitle}>Lender Leaderboard</div>
                    <table className={s.table}>
                        <thead>
                            <tr>
                                <th>Lender</th>
                                <th>Funded</th>
                                <th>Pipeline</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lenderStats.slice(0, 5).map((ls: any) => (
                                <tr key={ls.name}>
                                    <td style={{ fontWeight: 600 }}>{ls.name}</td>
                                    <td>${(ls.fundedVolume / 1e6).toFixed(1)}M <div style={{ fontSize: 11, color: 'var(--bb-muted)' }}>{ls.fundedCount} deals</div></td>
                                    <td>${(ls.pipelineVolume / 1e6).toFixed(1)}M</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={s.card} style={{ marginTop: 24 }}>
                <div className={s.cardTitle}>Pipeline Aging Analysis</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    {[
                        { label: '0-7 Days', days: 7, count: active.filter((d: any) => (new Date().getTime() - new Date(d.createdAt).getTime()) / 86400000 <= 7).length },
                        { label: '8-14 Days', days: 14, count: active.filter((d: any) => { const age = (new Date().getTime() - new Date(d.createdAt).getTime()) / 86400000; return age > 7 && age <= 14; }).length },
                        { label: '15-30 Days', days: 30, count: active.filter((d: any) => { const age = (new Date().getTime() - new Date(d.createdAt).getTime()) / 86400000; return age > 14 && age <= 30; }).length },
                        { label: '30+ Days', days: 31, count: active.filter((d: any) => (new Date().getTime() - new Date(d.createdAt).getTime()) / 86400000 > 30).length },
                    ].map(tier => (
                        <div key={tier.label} style={{ padding: 16, border: '1px solid var(--bb-border)', borderRadius: 8, textAlign: 'center' }}>
                            <div style={{ fontSize: 24, fontWeight: 700, color: tier.days > 15 ? 'var(--bb-danger)' : 'var(--bb-success)' }}>{tier.count}</div>
                            <div style={{ fontSize: 13, color: 'var(--bb-muted)', fontWeight: 600 }}>{tier.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
