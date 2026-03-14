import Link from 'next/link';
import s from '@/styles/shared.module.css';
import { notFound } from 'next/navigation';
import BorrowerEditForm, { type BorrowerEditFormProps } from './BorrowerEditForm';
import NoteTimeline from '@/components/NoteTimeline';
import TaskList from '@/components/TaskList';
import { leadFreshness, documentCompleteness, getNextBestActions } from '@/lib/domain';
import { selectBorrowerById } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';

export default async function BorrowerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let borrower: Awaited<ReturnType<typeof selectBorrowerById>>;
  try {
    borrower = await selectBorrowerById(id);
  } catch {
    return notFound();
  }

  const deals = (borrower.deals ?? []) as { updatedAt: unknown; id: string; borrowerId: string; stage: string }[];
  const docRequests = (borrower.docRequests ?? []) as { id: string; status: string; createdAt: unknown; expiresAt: unknown }[];

  const borrowerUpdatedAt = borrower.updatedAt instanceof Date ? borrower.updatedAt : new Date((borrower.updatedAt as string) || 0);
  const freshness = leadFreshness(
    { id: borrower.id as string, updatedAt: borrowerUpdatedAt },
    deals[0]?.updatedAt != null ? new Date(deals[0].updatedAt as string) : undefined
  );
  const docStats = documentCompleteness(
    docRequests.map((d) => ({
      id: d.id,
      status: d.status,
      createdAt: d.createdAt instanceof Date ? d.createdAt : new Date((d.createdAt as string) || 0),
      expiresAt: d.expiresAt != null ? (d.expiresAt instanceof Date ? d.expiresAt : new Date(d.expiresAt as string)) : null,
    }))
  );
  const nbaDocSnapshots = docRequests.map((d) => ({
    id: d.id,
    borrowerId: id,
    dealId: (d as { dealId?: string }).dealId ?? null,
    status: d.status,
    createdAt: d.createdAt instanceof Date ? d.createdAt : new Date((d.createdAt as string) || 0),
  }));
  const nbaForBorrower = getNextBestActions(
    [{ id: borrower.id as string, updatedAt: borrowerUpdatedAt }],
    deals.map((d) => ({
      id: d.id,
      borrowerId: d.borrowerId,
      stage: d.stage,
      updatedAt: d.updatedAt instanceof Date ? d.updatedAt : new Date((d.updatedAt as string) || 0),
    })),
    [],
    nbaDocSnapshots,
  );

  const scenarios = (borrower.scenarios ?? []) as { id: string; name: string; results: unknown; inputs: unknown; isPreferred: boolean }[];

  return (
    <>
      <div className={s.pageHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--bb-muted)', marginBottom: 4 }}>
              <Link href="/borrowers" style={{ color: 'var(--bb-accent)' }}>Borrowers</Link>
            </p>
            <h1>{(borrower as { firstName?: string; lastName?: string }).firstName} {(borrower as { lastName?: string }).lastName}</h1>
            <p style={{ fontSize: 14, color: 'var(--bb-text-secondary)' }}>{(borrower as { email?: string }).email}</p>
          </div>
          <span className={`${s.pill} ${freshness.label === 'stale' ? s.pillYellow : s.pillGreen}`}>{freshness.label}</span>
        </div>
      </div>

      {nbaForBorrower.length > 0 && (
        <div className={s.card} style={{ marginBottom: 24, borderLeft: '4px solid var(--bb-accent)' }}>
          <div className={s.cardTitle} style={{ marginBottom: 8 }}>Suggested next steps</div>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--bb-text-secondary)' }}>
            {nbaForBorrower.map((a) => (
              <li key={a.type + a.entityId}>
                {a.href ? <Link href={a.href} style={{ color: 'var(--bb-accent)' }}>{a.title}</Link> : a.title} — {a.reason}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={s.grid2}>
        <BorrowerEditForm borrower={borrower as BorrowerEditFormProps['borrower']} />
        <div className={s.card}>
          <div className={s.cardTitle}>Document completeness</div>
          <div style={{ fontSize: 14 }}>{docStats.requested ? `${docStats.pctComplete}% (${docStats.verified}/${docStats.requested} verified)` : 'No doc requests'}</div>
        </div>
      </div>

      <div className={s.card} style={{ marginTop: 24 }}>
        <div className={s.cardTitle}>Deals</div>
        {deals.length === 0 ? (
          <div className={s.emptyState}>No deals for this borrower.</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {deals.map((d) => (
              <li key={d.id} style={{ marginBottom: 8 }}>
                <Link href={`/deals/${d.id}`} style={{ color: 'var(--bb-accent)', fontWeight: 600 }}>Deal #{d.id.slice(-6)}</Link>
                <span className={s.pill} style={{ marginLeft: 8 }}>{d.stage}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={s.card} style={{ marginTop: 24 }}>
        <div className={s.cardTitle}>Notes & Activity</div>
        <NoteTimeline entityType="Borrower" entityId={id} />
      </div>

      <div className={s.card} style={{ marginTop: 24 }}>
        <div className={s.cardTitle}>Tasks</div>
        <TaskList entityType="Borrower" entityId={id} />
      </div>
    </>
  );
}