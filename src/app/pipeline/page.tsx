import React from 'react';
import { GdsTdsCalculator } from '@/components/calculators/GdsTdsCalculator';
import prisma from '@/lib/prisma';
import s from '@/styles/shared.module.css';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PipelineDashboard() {
  const deals = await prisma.deal.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { borrower: true, lender: true },
  });

  const stages = ['intake', 'in_review', 'matched', 'committed', 'funded'];

  const stageColor = (stage: string) =>
    stage === 'funded' ? s.pillGreen
      : stage === 'committed' ? s.pillBlue
        : stage === 'matched' ? s.pillYellow
          : stage === 'declined' ? s.pillRed
            : s.pillGray;

  return (
    <>
      <div className={s.pageHeader}>
        <h1>Mortgage Pipeline</h1>
        <p>Production dashboards tracking deal velocity, structured correctly for brokerbox.ca.</p>
      </div>

      <div className={s.grid2} style={{ marginBottom: 32 }}>
        <div className={s.card}>
          <div className={s.cardTitle} style={{ marginBottom: 16 }}>GDS/TDS Calculator</div>
          <GdsTdsCalculator />
        </div>

        <div className={s.card}>
            <div className={s.cardTitle}>Pipeline Health</div>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {stages.map(st => {
                  const stageDeals = deals.filter(d => d.stage === st);
                  const volume = stageDeals.reduce((sum, d) => sum + d.loanAmount, 0);
                  
                  return (
                      <div key={st} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--bb-border)' }}>
                          <span style={{ textTransform: 'capitalize' }}>{st.replace('_', ' ')}</span>
                          <div style={{ display: 'flex', gap: 24 }}>
                              <span style={{ color: 'var(--bb-text-secondary)' }}>{stageDeals.length} Deals</span>
                              <span style={{ fontWeight: 600, minWidth: 80, textAlign: 'right' }}>${(volume / 1e6).toFixed(1)}M</span>
                          </div>
                      </div>
                  )
              })}
            </div>
        </div>
      </div>

      <div className={s.card}>
        <div className={s.cardTitle} style={{ marginBottom: 24 }}>Active Lead Management</div>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Borrower</th>
              <th>Loan Amount</th>
              <th>Property Type</th>
              <th>Location</th>
              <th>Stage</th>
              <th>GDS/TDS</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {deals.map(d => (
              <tr key={d.id}>
                <td>
                    <Link href={`/borrowers/${d.borrowerId}`} style={{ fontWeight: 500, color: 'var(--bb-accent)', textDecoration: 'none' }}>
                        {d.borrower.firstName} {d.borrower.lastName}
                    </Link>
                </td>
                <td>${d.loanAmount.toLocaleString()}</td>
                <td><span style={{ textTransform: 'capitalize', color: 'var(--bb-text-secondary)' }}>{d.propertyType.replace('_', ' ')}</span></td>
                <td>{d.borrower.city || 'Unknown'}, {d.borrower.province}</td>
                <td><span className={`${s.pill} ${stageColor(d.stage)}`}>{d.stage.replace('_', ' ')}</span></td>
                <td>
                    {d.gds || d.tds ? (
                        <span style={{ color: (d.gds && d.gds > 39) || (d.tds && d.tds > 44) ? 'var(--bb-danger)' : 'var(--bb-success)' }}>
                            {d.gds?.toFixed(1) ?? '--'} / {d.tds?.toFixed(1) ?? '--'}
                        </span>
                    ) : '-- / --'}
                </td>
                <td>
                  <Link href={`/deals/${d.id}`} className={s.btnPrimary} style={{ padding: '4px 12px', fontSize: 13, textDecoration: 'none' }}>
                    View Deal
                  </Link>
                </td>
              </tr>
            ))}
            {deals.length === 0 && (
                <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--bb-text-secondary)' }}>
                        No leads matched.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
