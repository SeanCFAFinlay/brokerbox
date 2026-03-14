import Link from 'next/link';
import s from '@/styles/shared.module.css';
import { getAdminClient, rowsToApp } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function FundFlowPage() {
  const supabase = getAdminClient();
  const { data: lendersData } = await supabase.from('lender').select('*').eq('status', 'active').order('name', { ascending: true });
  const lenders = rowsToApp((lendersData ?? []) as Record<string, unknown>[]);
  const { data: dealsData } = await supabase
    .from('deal')
    .select('*, borrower(*), lender(*)')
    .in('stage', ['in_review', 'matched', 'committed', 'funded'])
    .order('closing_date', { ascending: true });
  const activeDeals = rowsToApp((dealsData ?? []) as Record<string, unknown>[]);

  const lenderList = Array.isArray(lenders) ? lenders : [];
  const dealList = Array.isArray(activeDeals) ? activeDeals : [];
  const totalAvailable = lenderList.reduce((sum: number, l: Record<string, unknown>) => sum + Number((l.capitalAvailable ?? l.capital_available) ?? 0), 0);
  const totalCommitted = lenderList.reduce((sum: number, l: Record<string, unknown>) => sum + Number((l.capitalCommitted ?? l.capital_committed) ?? 0), 0);
  const fundedYTD = dealList
    .filter((d: Record<string, unknown>) => d.stage === 'funded' && d.fundingDate && new Date((d.fundingDate ?? d.funding_date) as string).getFullYear() === new Date().getFullYear())
    .reduce((sum: number, d: Record<string, unknown>) => sum + Number((d.loanAmount ?? d.loan_amount) ?? 0), 0);
  const committedPipeline = dealList
    .filter((d: Record<string, unknown>) => d.stage === 'committed')
    .reduce((sum: number, d: Record<string, unknown>) => sum + Number((d.loanAmount ?? d.loan_amount) ?? 0), 0);
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const now = new Date();
  const upcomingClosings = dealList.filter(
    (d: { stage: string; closingDate?: string }) =>
      d.stage !== 'funded' &&
      d.closingDate &&
      new Date(d.closingDate) <= thirtyDaysFromNow &&
      new Date(d.closingDate) >= now
  );

  return (
    <>
      <div className={s.pageHeader}>
        <h1>💸 FundFlow Tracker</h1>
        <p>Track capital allocation, lender dry powder, and upcoming funding requirements</p>
      </div>

      <div className={s.kpiRow} style={{ marginBottom: 24, gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Total Dry Powder</div>
          <div className={s.kpiValue} style={{ color: 'var(--bb-success)' }}>${(Number(totalAvailable) / 1e6).toFixed(1)}M</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Capital Committed</div>
          <div className={s.kpiValue}>${(Number(totalCommitted) / 1e6).toFixed(1)}M</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Pipeline Committed</div>
          <div className={s.kpiValue}>${(Number(committedPipeline) / 1e6).toFixed(1)}M</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Funded YTD</div>
          <div className={s.kpiValue}>${(Number(fundedYTD) / 1e6).toFixed(1)}M</div>
        </div>
      </div>

      <div className={s.card} style={{ marginBottom: 24 }}>
        <div className={s.cardTitle}>Upcoming Closings (Next 30 days)</div>
        {upcomingClosings.length === 0 ? (
          <div className={s.emptyState}>No upcoming closings in the next 30 days.</div>
        ) : (
          <table className={s.table}>
            <thead><tr><th>Borrower</th><th>Lender</th><th>Amount</th><th>Closing</th><th></th></tr></thead>
            <tbody>
              {upcomingClosings.map((d: { id: string; borrower?: { firstName?: string; lastName?: string }; lender?: { name?: string }; loanAmount?: number; closingDate?: string }) => (
                <tr key={d.id}>
                  <td>{d.borrower?.firstName} {d.borrower?.lastName}</td>
                  <td>{d.lender?.name || '—'}</td>
                  <td>${(d.loanAmount ?? 0).toLocaleString()}</td>
                  <td>{d.closingDate ? new Date(d.closingDate).toLocaleDateString() : '—'}</td>
                  <td><Link href={`/deals/${d.id}`} className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
