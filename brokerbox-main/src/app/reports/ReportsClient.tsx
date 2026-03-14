'use client';
import { useMemo } from 'react';
import s from '@/styles/shared.module.css';

interface Deal { id: string; stage: string; loanAmount: number; propertyType: string; createdAt: string; fundingDate: string | null; lender?: { name: string } | null; borrower: { firstName: string, lastName: string }; totalRevenue: number | null; agentCommissionSplit: number; netBrokerageRevenue: number | null; }
interface AuditLog { id: string; timestamp: Date; actor: string; entity: string; entityId: string; action: string; diff: any; }

export default function ReportsClient({ deals, auditLogs, totalBorrowers }: { deals: Deal[], auditLogs: AuditLog[], totalBorrowers: number }) {

    // Derived Metrics
    const stages = ['intake', 'in_review', 'matched', 'committed', 'funded', 'declined', 'archived'];

    const pipelineSummary = stages.map(stage => ({
        stage,
        count: deals.filter(d => d.stage === stage).length,
        volume: deals.filter(d => d.stage === stage).reduce((s, d) => s + d.loanAmount, 0),
    })).filter(p => p.count > 0);

    const fundedDeals = deals.filter(d => d.stage === 'funded');
    const totalFunded = fundedDeals.reduce((s, d) => s + d.loanAmount, 0);

    const totalPipelineGross = deals.reduce((s, d) => s + (d.totalRevenue || 0), 0);
    const totalPipelineNet = deals.reduce((s, d) => s + (d.netBrokerageRevenue || 0), 0);

    const lenderWins: Record<string, number> = {};
    fundedDeals.forEach(d => {
        if (d.lender) lenderWins[d.lender.name] = (lenderWins[d.lender.name] || 0) + 1;
    });

    // Close Rate (Funded / (Funded + Declined + Archived))
    const closedCount = deals.filter(d => ['funded', 'declined', 'archived'].includes(d.stage)).length;
    const closeRate = closedCount > 0 ? (fundedDeals.length / closedCount) * 100 : 0;

    // Time to Fund (avg days between createdAt and fundingDate)
    const fundedWithDates = fundedDeals.filter(d => d.fundingDate);
    const avgDaysToFund = fundedWithDates.length > 0
        ? fundedWithDates.reduce((sum, d) => sum + (new Date(d.fundingDate!).getTime() - new Date(d.createdAt).getTime()) / (1000 * 3600 * 24), 0) / fundedWithDates.length
        : 0;

    // Deals by Property Type
    const propertyTypes: Record<string, { count: number, volume: number }> = {};
    deals.forEach(d => {
        if (!propertyTypes[d.propertyType]) propertyTypes[d.propertyType] = { count: 0, volume: 0 };
        propertyTypes[d.propertyType].count++;
        propertyTypes[d.propertyType].volume += d.loanAmount;
    });

    const entityTypes = Array.from(new Set(auditLogs.map(l => l.entity)));

    function downloadCSV() {
        const headers = ['Deal ID', 'Borrower', 'Lender', 'Stage', 'Loan Amount', 'Property Type', 'Created Date', 'Funding Date', 'Total Gross Revenue', 'Agent Split (%)', 'Brokerage Net Retained'];
        const rows = deals.map(d => [
            d.id,
            `"${d.borrower.firstName} ${d.borrower.lastName}"`,
            `"${d.lender?.name || ''}"`,
            d.stage,
            d.loanAmount,
            d.propertyType,
            new Date(d.createdAt).toISOString().split('T')[0],
            d.fundingDate ? new Date(d.fundingDate).toISOString().split('T')[0] : '',
            d.totalRevenue || 0,
            d.agentCommissionSplit || 0,
            d.netBrokerageRevenue || 0
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(',') + "\n"
            + rows.map(e => e.join(',')).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `brokerbox_deals_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <>
            <div className={s.pageHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>📈 Reports & Analytics</h1>
                        <p>Pipeline summaries, performance metrics, and audit trail</p>
                    </div>
                    <button className={`${s.btn} ${s.btnPrimary}`} onClick={downloadCSV}>⬇ Export Deals to CSV</button>
                </div>
            </div>

            <div className={s.kpiRow} style={{ marginBottom: 24, gridTemplateColumns: 'repeat(6, 1fr)' }}>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Total Deals</div><div className={s.kpiValue}>{deals.length}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Close Rate</div><div className={s.kpiValue} style={{ color: 'var(--bb-success)' }}>{closeRate.toFixed(1)}%</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Avg Time to Fund</div><div className={s.kpiValue}>{avgDaysToFund > 0 ? `${avgDaysToFund.toFixed(0)} days` : 'N/A'}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Total Borrowers</div><div className={s.kpiValue}>{totalBorrowers}</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Pipeline Gross Revenue</div><div className={s.kpiValue} style={{ color: 'var(--bb-brand)' }}>${(totalPipelineGross / 1000).toFixed(1)}K</div></div>
                <div className={s.kpiCard}><div className={s.kpiLabel}>Brokerage Net Retained</div><div className={s.kpiValue} style={{ color: 'var(--bb-success)' }}>${(totalPipelineNet / 1000).toFixed(1)}K</div></div>
            </div>

            <div className={s.grid2}>
                {/* Pipeline Summary */}
                <div className={s.card}>
                    <div className={s.cardTitle}>Pipeline by Stage</div>
                    <table className={s.table}>
                        <thead><tr><th>Stage</th><th>Deals</th><th>Volume</th></tr></thead>
                        <tbody>
                            {pipelineSummary.map(p => (
                                <tr key={p.stage}>
                                    <td><span className={`${s.pill} ${p.stage === 'funded' ? s.pillGreen : p.stage === 'committed' ? s.pillBlue : s.pillGray}`}>{p.stage.toUpperCase()}</span></td>
                                    <td>{p.count}</td>
                                    <td>${(p.volume / 1000).toFixed(0)}K</td>
                                </tr>
                            ))}
                            <tr style={{ fontWeight: 700, backgroundColor: 'var(--bb-bg)' }}>
                                <td>TOTAL FUNDED</td>
                                <td>{fundedDeals.length}</td>
                                <td>${(totalFunded / 1e6).toFixed(2)}M</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Deals by Property Type */}
                <div className={s.card}>
                    <div className={s.cardTitle}>Volume by Property Type</div>
                    <table className={s.table}>
                        <thead><tr><th>Property Type</th><th>Deals</th><th>Volume</th></tr></thead>
                        <tbody>
                            {Object.entries(propertyTypes).sort((a, b) => b[1].volume - a[1].volume).map(([type, stats]) => (
                                <tr key={type}>
                                    <td style={{ textTransform: 'capitalize' }}>{type}</td>
                                    <td>{stats.count}</td>
                                    <td>${(stats.volume / 1e6).toFixed(2)}M</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Lender Win Rates */}
            {Object.keys(lenderWins).length > 0 && (
                <div className={s.card} style={{ marginTop: 24 }}>
                    <div className={s.cardTitle}>Lender Win Rates (Funded Deals)</div>
                    <table className={s.table}>
                        <thead><tr><th>Lender</th><th>Funded Deals</th><th>Share of Volume</th></tr></thead>
                        <tbody>
                            {Object.entries(lenderWins).sort((a, b) => b[1] - a[1]).map(([name, wins]) => (
                                <tr key={name}>
                                    <td>{name}</td>
                                    <td>{wins}</td>
                                    <td>{((wins / fundedDeals.length) * 100).toFixed(0)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Audit Log */}
            <div className={s.card} style={{ marginTop: 24 }}>
                <div className={s.cardTitle}>Audit Trail ({auditLogs.length} recent events)</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: 'var(--bb-muted)', paddingTop: 4 }}>Entities seen:</span>
                    {entityTypes.map(t => <span key={t} className={`${s.pill} ${s.pillGray}`} style={{ fontSize: 10 }}>{t}</span>)}
                </div>
                <table className={s.table}>
                    <thead><tr><th>Timestamp</th><th>Actor</th><th>Entity</th><th>Action</th><th>Details</th></tr></thead>
                    <tbody>
                        {auditLogs.map(log => (
                            <tr key={log.id}>
                                <td style={{ fontSize: 12, whiteSpace: 'nowrap', color: 'var(--bb-muted)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                <td>{log.actor}</td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{log.entity}</div>
                                    <div style={{ fontSize: 11, color: 'var(--bb-muted)', fontFamily: 'monospace' }}>#{log.entityId.slice(0, 8)}</div>
                                </td>
                                <td>
                                    <span className={`${s.pill} ${log.action === 'CREATE' ? s.pillGreen : log.action === 'DELETE' ? s.pillRed : log.action === 'UPDATE' ? s.pillBlue : s.pillYellow}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td style={{ fontSize: 12, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {log.diff ? JSON.stringify(log.diff).substring(0, 100) + '...' : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
