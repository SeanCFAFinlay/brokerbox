import prisma from '@/lib/prisma';
import s from '@/styles/shared.module.css';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    const [auditLogs, deals, borrowers] = await Promise.all([
        prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' }, take: 100 }),
        prisma.deal.findMany({ include: { borrower: true, lender: true } }),
        prisma.borrower.count(),
    ]);

    const stages = ['intake', 'submitted', 'approved', 'funded', 'closed'];
    const pipelineSummary = stages.map(stage => ({
        stage,
        count: deals.filter(d => d.stage === stage).length,
        volume: deals.filter(d => d.stage === stage).reduce((s, d) => s + d.loanAmount, 0),
    }));

    const fundedDeals = deals.filter(d => d.stage === 'funded');
    const totalFunded = fundedDeals.reduce((s, d) => s + d.loanAmount, 0);

    const lenderWins: Record<string, number> = {};
    fundedDeals.forEach(d => {
        if (d.lender) lenderWins[d.lender.name] = (lenderWins[d.lender.name] || 0) + 1;
    });

    const entityTypes = [...new Set(auditLogs.map(l => l.entity))];

    return (
        <>
            <div className={s.pageHeader}>
                <h1>📈 Reports</h1>
                <p>Pipeline summaries, audit trail, and match outcomes</p>
            </div>

            {/* Pipeline Summary */}
            <div className={s.card} style={{ marginBottom: 24 }}>
                <div className={s.cardTitle}>Pipeline Summary</div>
                <table className={s.table}>
                    <thead><tr><th>Stage</th><th>Deals</th><th>Volume</th></tr></thead>
                    <tbody>
                        {pipelineSummary.map(p => (
                            <tr key={p.stage}>
                                <td><span className={`${s.pill} ${p.stage === 'funded' ? s.pillGreen : p.stage === 'approved' ? s.pillBlue : s.pillGray}`}>{p.stage.toUpperCase()}</span></td>
                                <td>{p.count}</td>
                                <td>${(p.volume / 1000).toFixed(0)}K</td>
                            </tr>
                        ))}
                        <tr style={{ fontWeight: 700 }}>
                            <td>TOTAL FUNDED</td>
                            <td>{fundedDeals.length}</td>
                            <td>${(totalFunded / 1e6).toFixed(2)}M</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Lender Win Rates */}
            {Object.keys(lenderWins).length > 0 && (
                <div className={s.card} style={{ marginBottom: 24 }}>
                    <div className={s.cardTitle}>Lender Win Rates (Funded Deals)</div>
                    <table className={s.table}>
                        <thead><tr><th>Lender</th><th>Wins</th><th>Share</th></tr></thead>
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
            <div className={s.card}>
                <div className={s.cardTitle}>Audit Log ({auditLogs.length} events)</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                    {entityTypes.map(t => <span key={t} className={`${s.pill} ${s.pillBlue}`}>{t}</span>)}
                </div>
                <table className={s.table}>
                    <thead><tr><th>Timestamp</th><th>Actor</th><th>Entity</th><th>Action</th><th>Details</th></tr></thead>
                    <tbody>
                        {auditLogs.map(log => (
                            <tr key={log.id}>
                                <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                <td>{log.actor}</td>
                                <td>{log.entity} #{log.entityId.slice(-6)}</td>
                                <td>
                                    <span className={`${s.pill} ${log.action === 'CREATE' ? s.pillGreen : log.action === 'DELETE' ? s.pillRed : s.pillYellow}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td style={{ fontSize: 12, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {log.diff ? JSON.stringify(log.diff).slice(0, 80) : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
