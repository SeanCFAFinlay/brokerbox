import s from '@/styles/shared.module.css';
import LenderActions from './LenderActions';
import LenderTable from './LenderTable';
import { getAdminClient, rowsToApp } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function LendersPage() {
  const supabase = getAdminClient();
  const { data } = await supabase.from('lender').select('*').order('name', { ascending: true });
  const lenders = rowsToApp((data ?? []) as Record<string, unknown>[]);
  const list = (Array.isArray(lenders) ? lenders : []) as Record<string, unknown>[];
  const totalCapital = list.reduce((sum: number, l) => sum + Number((l.capitalAvailable ?? l.capital_available) ?? 0), 0);

  return (
    <>
      <div className={s.pageHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Lenders</h1>
            <p>{list.length} lenders in your network · ${(Number(totalCapital) / 1e6).toFixed(1)}M available capital</p>
          </div>
          <LenderActions />
        </div>
      </div>

      <LenderTable lenders={list as unknown as Parameters<typeof LenderTable>[0]['lenders']} />
    </>
  );
}
