import Link from 'next/link';
import s from '@/styles/shared.module.css';
import { getAdminClient, rowToApp } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function LenderDealsPage() {
  const supabase = getAdminClient();
  const { data: lenderRow } = await supabase
    .from('lender')
    .select('*, deal(*, borrower(*))')
    .eq('status', 'active')
    .limit(1)
    .single();
  if (!lenderRow) return <div>No Lender Found</div>;
  const lender = rowToApp(lenderRow as Record<string, unknown>) as Record<string, unknown>;
  const deals = (lender.deal ? (Array.isArray(lender.deal) ? lender.deal : [lender.deal]) : []) as { id: string; stage: string; loanAmount: number; propertyAddress?: string; borrower?: { firstName?: string; lastName?: string } }[];
  const stageColor = (st: string) => st === 'funded' ? s.pillGreen : st === 'committed' ? s.pillBlue : st === 'declined' ? s.pillRed : s.pillYellow;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
      <div className={s.pageHeader}>
        <h1>📂 Deal Pipeline</h1>
        <p>All deals submitted to or funded by {lender.name as string}</p>
      </div>
      <div className={s.card}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Borrower</th>
              <th>Amount</th>
              <th>Stage</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {deals.map((d) => (
              <tr key={d.id}>
                <td>{d.borrower?.firstName} {d.borrower?.lastName}</td>
                <td>${d.loanAmount.toLocaleString()}</td>
                <td><span className={s.pill}>{stageColor(d.stage)}</span> {d.stage}</td>
                <td><Link href={`/portal/lender/deals/${d.id}`} className={`${s.btn} ${s.btnSmall}`}>Review</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
