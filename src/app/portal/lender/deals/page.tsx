import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import s from '@/styles/shared.module.css';

export const dynamic = 'force-dynamic';

export default async function LenderDealsPage() {
    const { data: lender, error } = await supabase
        .from('Lender')
        .select('*, deals:Deal(*, borrower:Borrower(*))')
        .eq('status', 'active')
        .limit(1)
        .single();

    if (error || !lender) return <div>No Lender Found</div>;

    const deals = Array.isArray(lender.deals) ? lender.deals : [];
    // Manual sort and Filter Fix guards
    deals.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const stageColor = (st: string) => st === 'funded' ? s.pillGreen : st === 'committed' ? s.pillBlue : st === 'declined' ? s.pillRed : s.pillYellow;

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
            <div className={s.pageHeader}>
                <h1>📂 Deal Pipeline</h1>
                <p>All deals submitted to or funded by {lender.name}</p>
            </div>

            <div className={s.card}>
                <table className={s.table}>
                    <thead>
                        <tr>
                            <th>Borrower</th>
                            <th>Property</th>
                            <th>Loan Amount</th>
                            <th>LTV</th>
                            <th>Stage</th>
                            <th>Submitted</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deals.map(d => (
                            <tr key={d.id}>
                                <td><div style={{ fontWeight: 600 }}>{d.borrower?.firstName} {d.borrower?.lastName}</div></td>
                                <td>{d.propertyAddress || 'Unnamed Deal'}</td>
                                <td>${d.loanAmount?.toLocaleString()}</td>
                                <td>{d.ltv ? `${d.ltv.toFixed(1)}%` : '—'}</td>
                                <td><span className={`${s.pill} ${stageColor(d.stage)}`}>{d.stage?.replace('_', ' ').toUpperCase()}</span></td>
                                <td style={{ fontSize: 13, color: 'var(--bb-muted)' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                                <td><Link href={`/portal/lender/deals/${d.id}`} className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`}>Review</Link></td>
                            </tr>
                        ))}
                        {deals.length === 0 && (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>No deals in pipeline.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
