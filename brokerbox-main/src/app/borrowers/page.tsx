import s from '@/styles/shared.module.css';
import BorrowerActions from './BorrowerActions';
import BorrowerTable, { type BorrowerRow } from './BorrowerTable';
import { getAdminClient, rowsToApp } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function BorrowersPage() {
  const supabase = getAdminClient();
  const { data } = await supabase
    .from('borrower')
    .select('*')
    .order('updated_at', { ascending: false });
  const rows = rowsToApp((data ?? []) as Record<string, unknown>[]);
  const borrowers = rows as BorrowerRow[];

  return (
    <>
      <div className={s.pageHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Borrowers</h1>
            <p>{Array.isArray(borrowers) ? borrowers.length : 0} borrowers in your CRM</p>
          </div>
          <BorrowerActions />
        </div>
      </div>

      <BorrowerTable borrowers={borrowers} />
    </>
  );
}
