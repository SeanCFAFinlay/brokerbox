import Link from 'next/link';
import s from '@/styles/shared.module.css';
import FileUpload from '@/components/docvault/FileUpload';
import { getAdminClient, rowToApp } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function BorrowerDocumentsPage() {
  const supabase = getAdminClient();
  const { data: borrowerRow } = await supabase
    .from('borrower')
    .select('*, doc_request(*, document_file(*))')
    .eq('status', 'active')
    .limit(1)
    .single();
  if (!borrowerRow) return <div>Borrower not found</div>;
  const borrower = rowToApp(borrowerRow as Record<string, unknown>) as Record<string, unknown>;
  const docRequests = borrower.docRequest ? (Array.isArray(borrower.docRequest) ? borrower.docRequest : [borrower.docRequest]) : [];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
      <div className={s.pageHeader}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--bb-muted)', marginBottom: 4 }}>
            <Link href="/portal/borrower" style={{ color: 'var(--bb-accent)' }}>Dashboard</Link> / Documents
          </p>
          <h1>My Document Vault</h1>
          <p>Securely manage and track all documents associated with your mortgage applications.</p>
        </div>
      </div>
      <div className={s.card}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Document Type</th>
              <th>Status</th>
              <th>Action / Files</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {(docRequests as { id: string; docType: string; status: string; updatedAt: string; files?: unknown[] }[]).map((dr) => (
              <tr key={dr.id}>
                <td>{dr.docType}</td>
                <td><span className={s.pill}>{dr.status}</span></td>
                <td><FileUpload borrowerId={borrower.id as string} docType={dr.docType ?? 'general'} category={(dr as { category?: string }).category ?? 'general'} /></td>
                <td>{dr.updatedAt ? new Date(dr.updatedAt).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
