import Link from 'next/link';
import s from '@/styles/shared.module.css';
import { getAdminClient, rowsToApp } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function LoansPage() {
  const supabase = getAdminClient();
  const { data } = await supabase
    .from('loan')
    .select('*, deal(*, borrower(*), lender(*))')
    .order('funded_date', { ascending: false });
  const loans = rowsToApp((data ?? []) as Record<string, unknown>[]);
  const loanList = Array.isArray(loans) ? loans : [];
  const activeLoans = loanList.filter((l: Record<string, unknown>) => (l.status ?? l.status) === 'active') as Record<string, unknown>[];
  const totalAUM = activeLoans.reduce((sum: number, l) => sum + Number((l.principalBalance ?? l.principal_balance) ?? 0), 0);

  return (
    <div style={{ padding: '40px' }}>
      <div className={s.pageHeader}>
        <div>
          <h1>Loan Management</h1>
          <p>Track funded mortgages, principal balances, and payment health</p>
        </div>
      </div>

      <div className={s.kpiRow} style={{ marginBottom: 32 }}>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Active Loans</div>
          <div className={s.kpiValue}>{activeLoans.length}</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Total AUM</div>
          <div className={s.kpiValue}>${(Number(totalAUM) / 1e6).toFixed(1)}M</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Avg Rate</div>
          <div className={s.kpiValue}>
            {activeLoans.length > 0 ? (activeLoans.reduce((s: number, l) => s + Number((l.interestRate ?? l.interest_rate) ?? 0), 0) / activeLoans.length).toFixed(2) : '0.00'}%
          </div>
        </div>
      </div>

      <div className={s.card}>
        <div className={s.cardTitle}>Loan Portfolio</div>
        {loanList.length === 0 ? (
          <div className={s.emptyState}>No funded loans found. Deals marked as &quot;Funded&quot; will appear here.</div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Borrower</th>
                <th>Lender</th>
                <th>Principal</th>
                <th>Rate</th>
                <th>Maturity</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loanList.map((l: { id: string; deal?: { borrower?: { firstName?: string; lastName?: string }; lender?: { name?: string } }; principalBalance: number; interestRate: number; interestType: string; maturityDate: string; status: string }) => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 600 }}>
                    {l.deal?.borrower?.firstName} {l.deal?.borrower?.lastName}
                  </td>
                  <td>{l.deal?.lender?.name || '—'}</td>
                  <td>${l.principalBalance.toLocaleString()}</td>
                  <td>{l.interestRate}% ({l.interestType})</td>
                  <td>{new Date(l.maturityDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`${s.pill} ${l.status === 'active' ? s.pillGreen : s.pillGray}`}>
                      {l.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <Link href={`/loans/${l.id}`} className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`}>Manage</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
