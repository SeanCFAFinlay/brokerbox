import Link from 'next/link';
import s from '@/styles/shared.module.css';
import { notFound } from 'next/navigation';
import LenderDealActions from './LenderDealActions';
import { getAdminClient, rowToApp, rowsToApp } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function LenderDealReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getAdminClient();
  const { data: lenderRow } = await supabase.from('lender').select('*').eq('status', 'active').limit(1).single();
  if (!lenderRow) return <div>No Lender Found</div>;

  const { data: dealRow } = await supabase
    .from('deal')
    .select('*, borrower(*), doc_request(*, document_file(*))')
    .eq('id', id)
    .single();
  if (!dealRow) return notFound();
  const deal = rowToApp(dealRow as Record<string, unknown>) as Record<string, unknown>;
  if (deal.docRequest) {
    deal.docRequests = Array.isArray(deal.docRequest) ? deal.docRequest : [deal.docRequest];
    delete deal.docRequest;
  }

  const { data: condData } = await supabase
    .from('deal_condition')
    .select('*')
    .eq('deal_id', id)
    .order('created_at', { ascending: false });
  const conditions = rowsToApp((condData ?? []) as Record<string, unknown>[]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
      <div className={s.pageHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--bb-muted)', marginBottom: 4 }}>
              <Link href="/portal/lender/deals" style={{ color: 'var(--bb-accent)' }}>Pipeline</Link> /
              Review: {deal.propertyAddress ? String(deal.propertyAddress) : `Deal #${String(deal.id).slice(-6)}`}
            </p>
            <h1>Review Submission</h1>
          </div>
          <span className={`${s.pill} ${deal.stage === 'funded' ? s.pillGreen : deal.stage === 'committed' ? s.pillBlue : s.pillYellow}`}>
            {(deal.stage as string).replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>
      <div className={s.grid2}>
        <div className={s.card}>
          <div className={s.cardTitle}>Borrower</div>
          <p>{(deal.borrower as { firstName?: string; lastName?: string })?.firstName} {(deal.borrower as { lastName?: string })?.lastName}</p>
        </div>
        <div className={s.card}>
          <div className={s.cardTitle}>Conditions</div>
          {Array.isArray(conditions) && conditions.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 20 }}>{(conditions as { description: string; status: string }[]).map((c, i) => <li key={i}>{c.description} — {c.status}</li>)}</ul>
          ) : <div className={s.emptyState}>No conditions.</div>}
        </div>
      </div>
      <LenderDealActions dealId={id} stage={deal.stage as string} />
    </div>
  );
}
