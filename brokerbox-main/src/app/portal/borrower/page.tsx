import Link from 'next/link';
import s from '@/styles/shared.module.css';
import FileUpload from '@/components/docvault/FileUpload';
import { getAdminClient, rowToApp } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function BorrowerPortalDashboard() {
  const supabase = getAdminClient();
  const { data: borrowerRow } = await supabase
    .from('borrower')
    .select('*, deal(*, lender(*)), doc_request(*, document_file(*))')
    .eq('status', 'active')
    .limit(1)
    .single();
  if (!borrowerRow) {
    return <div style={{ padding: 40 }}><h2>Borrower Profile Not Found</h2><Link href="/borrowers">Go to Borrowers</Link></div>;
  }
  const borrower = rowToApp(borrowerRow as Record<string, unknown>) as Record<string, unknown>;
  const docRequests = borrower.docRequest ? (Array.isArray(borrower.docRequest) ? borrower.docRequest : [borrower.docRequest]) : [];
  const pendingDocs = docRequests.filter((dr: { status: string }) => dr.status === 'requested');
  const deals = borrower.deal ? (Array.isArray(borrower.deal) ? borrower.deal : [borrower.deal]) : [];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
      <div className={s.pageHeader}>
        <div>
          <h1>Hello, {borrower.firstName as string}</h1>
          <p>Track your mortgage application status and upload documents securely.</p>
        </div>
      </div>
      <div className={s.kpiRow}>
        <div className={s.kpiCard}><div className={s.kpiLabel}>Active Deals</div><div className={s.kpiValue}>{deals.length}</div></div>
        <div className={s.kpiCard}><div className={s.kpiLabel}>Pending Docs</div><div className={s.kpiValue}>{pendingDocs.length}</div></div>
      </div>
      <p><Link href="/portal/borrower/documents" className={s.btn}>Documents</Link></p>
    </div>
  );
}
