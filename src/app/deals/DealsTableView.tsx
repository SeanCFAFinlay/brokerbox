'use client';
import Link from 'next/link';
import s from '@/styles/shared.module.css';

interface Deal {
    id: string;
    stage: string;
    priority: string;
    propertyAddress: string | null;
    propertyType: string;
    propertyValue: number;
    loanAmount: number;
    ltv: number | null;
    position: string;
    loanPurpose: string;
    borrower: { firstName: string; lastName: string };
    lender: { name: string } | null;
}

const stageColor = (stage: string) =>
    stage === 'funded' ? s.pillGreen
        : stage === 'committed' ? s.pillBlue
            : stage === 'matched' ? s.pillYellow
                : stage === 'declined' || stage === 'archived' ? s.pillRed
                    : s.pillGray;

export default function DealsTableView({ deals }: { deals: Deal[] }) {
    return (
        <div className={s.card}>
            <table className={s.table}>
                <thead>
                    <tr>
                        <th>Borrower</th>
                        <th>Property</th>
                        <th>Loan Amount</th>
                        <th>LTV</th>
                        <th>Position</th>
                        <th>Purpose</th>
                        <th>Lender</th>
                        <th>Stage</th>
                        <th>Priority</th>
                    </tr>
                </thead>
                <tbody>
                    {deals.map(d => (
                        <tr key={d.id}>
                            <td>
                                <Link href={`/deals/${d.id}`} style={{ color: 'var(--bb-accent)', fontWeight: 600 }}>
                                    {d.borrower.firstName} {d.borrower.lastName}
                                </Link>
                            </td>
                            <td style={{ fontSize: 13 }}>{d.propertyAddress?.split(',')[0] || '—'}</td>
                            <td>${d.loanAmount.toLocaleString()}</td>
                            <td>{d.ltv ? `${d.ltv.toFixed(1)}%` : '—'}</td>
                            <td><span className={`${s.pill} ${s.pillBlue}`}>{d.position}</span></td>
                            <td style={{ fontSize: 13 }}>{d.loanPurpose.replace('_', ' ')}</td>
                            <td>{d.lender?.name || '—'}</td>
                            <td><span className={`${s.pill} ${stageColor(d.stage)}`}>{d.stage.replace('_', ' ')}</span></td>
                            <td><span className={`${s.pill} ${d.priority === 'urgent' ? s.pillRed : d.priority === 'high' ? s.pillYellow : s.pillGray}`}>{d.priority}</span></td>
                        </tr>
                    ))}
                    {deals.length === 0 && (
                        <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--bb-muted)', padding: 24 }}>No deals found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
