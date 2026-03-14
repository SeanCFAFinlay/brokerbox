import Link from 'next/link';
import s from '@/styles/shared.module.css';
import { getAdminClient, rowToApp } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getAdminClient();
  const { data: loanRow } = await supabase
    .from('loan')
    .select('*, deal(*, borrower(*), lender(*)), loan_payment(*), loan_fee(*)')
    .eq('id', id)
    .single();
  if (!loanRow) return <div style={{ padding: 40 }}>Loan not found</div>;

  const loan = rowToApp(loanRow as Record<string, unknown>) as Record<string, unknown>;
  const deal = loan.deal as { borrower?: { firstName?: string; lastName?: string }; propertyAddress?: string } | undefined;
  const payments = (loan.loanPayment ? (Array.isArray(loan.loanPayment) ? loan.loanPayment : [loan.loanPayment]) : []) as { id: string; amount: number; date: string; type: string; status: string }[];
  const fees = (loan.loanFee ? (Array.isArray(loan.loanFee) ? loan.loanFee : [loan.loanFee]) : []) as { id: string; amount: number; description: string; type: string; isPaid: boolean }[];

  return (
    <div style={{ padding: '40px' }}>
      <div className={s.pageHeader}>
        <div>
          <h1>Loan Detail: {deal?.borrower?.firstName} {deal?.borrower?.lastName}</h1>
          <p>{deal?.propertyAddress}</p>
        </div>
        <Link href="/loans" className={`${s.btn} ${s.btnSecondary}`}>&larr; Back to Loans</Link>
      </div>

      <div className={s.grid2}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className={s.card}>
            <div className={s.cardTitle}>Financial Overview</div>
            <div className={s.kpiRow} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div className={s.kpiCard}><div className={s.kpiLabel}>Current Balance</div><div className={s.kpiValue}>${Number(loan.principalBalance).toLocaleString()}</div></div>
              <div className={s.kpiCard}><div className={s.kpiLabel}>Interest Rate</div><div className={s.kpiValue}>{Number(loan.interestRate ?? 0)}%</div></div>
              <div className={s.kpiCard}><div className={s.kpiLabel}>Funded Date</div><div className={s.kpiValue}>{new Date(loan.fundedDate as string).toLocaleDateString()}</div></div>
              <div className={s.kpiCard}><div className={s.kpiLabel}>Maturity Date</div><div className={s.kpiValue}>{new Date(loan.maturityDate as string).toLocaleDateString()}</div></div>
            </div>
          </div>
        </div>
      </div>

      <div className={s.card} style={{ marginTop: 24 }}>
        <div className={s.cardTitle}>Payments</div>
        {payments.length === 0 ? <div className={s.emptyState}>No payments recorded.</div> : (
          <table className={s.table}>
            <thead><tr><th>Date</th><th>Amount</th><th>Type</th><th>Status</th></tr></thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{new Date(p.date).toLocaleDateString()}</td>
                  <td>${p.amount.toLocaleString()}</td>
                  <td>{p.type}</td>
                  <td><span className={s.pill}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={s.card} style={{ marginTop: 24 }}>
        <div className={s.cardTitle}>Fees</div>
        {fees.length === 0 ? <div className={s.emptyState}>No fees.</div> : (
          <table className={s.table}>
            <thead><tr><th>Description</th><th>Amount</th><th>Type</th><th>Paid</th></tr></thead>
            <tbody>
              {fees.map((f) => (
                <tr key={f.id}>
                  <td>{f.description}</td>
                  <td>${f.amount.toLocaleString()}</td>
                  <td>{f.type}</td>
                  <td>{f.isPaid ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
