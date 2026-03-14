import Link from 'next/link';
import s from '@/styles/shared.module.css';
import { notFound } from 'next/navigation';
import LenderEditForm from './LenderEditForm';
import NoteTimeline from '@/components/NoteTimeline';
import { getAdminClient, rowToApp } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function LenderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getAdminClient();
  const { data: lenderRow } = await supabase
    .from('lender')
    .select('*, deal(*, borrower(*))')
    .eq('id', id)
    .single();
  if (!lenderRow) return notFound();

  const lender = rowToApp(lenderRow as Record<string, unknown>) as Record<string, unknown>;
  const deals = (lender.deal ? (Array.isArray(lender.deal) ? lender.deal : [lender.deal]) : []) as { id: string; stage: string; loanAmount: number }[];
  const activeDeals = deals.filter((d) => d.stage !== 'declined' && d.stage !== 'archived' && d.stage !== 'funded');
  const fundedDeals = deals.filter((d) => d.stage === 'funded');
  const totalFunded = fundedDeals.reduce((sum, d) => sum + d.loanAmount, 0);
  const activePipeline = activeDeals.reduce((sum, d) => sum + d.loanAmount, 0);

  return (
    <>
      <div className={s.pageHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--bb-muted)', marginBottom: 4 }}>
              <Link href="/lenders" style={{ color: 'var(--bb-accent)' }}>Lenders</Link> / {lender.name as string}
            </p>
            <h1>{lender.name as string}</h1>
          </div>
          <span className={`${s.pill} ${lender.status === 'active' ? s.pillGreen : s.pillGray}`}>
            {(lender.status as string).toUpperCase()}
          </span>
        </div>
      </div>

      <div className={s.kpiRow} style={{ marginBottom: 24 }}>
        <div className={s.kpiCard}><div className={s.kpiLabel}>Active Pipeline</div><div className={s.kpiValue}>${activePipeline.toLocaleString()}</div></div>
        <div className={s.kpiCard}><div className={s.kpiLabel}>Funded</div><div className={s.kpiValue}>${totalFunded.toLocaleString()}</div></div>
      </div>

      <div className={s.grid2}>
        <LenderEditForm lender={lender} />
        <div className={s.card}>
          <div className={s.cardTitle}>Notes</div>
          <NoteTimeline entityType="Lender" entityId={id} />
        </div>
      </div>

      <div className={s.card} style={{ marginTop: 24 }}>
        <div className={s.cardTitle}>Deals</div>
        {deals.length === 0 ? <div className={s.emptyState}>No deals.</div> : (
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {deals.map((d: { id: string; stage: string }) => (
              <li key={d.id}><Link href={`/deals/${d.id}`}>{d.id.slice(-6)}</Link> <span className={s.pill}>{d.stage}</span></li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}