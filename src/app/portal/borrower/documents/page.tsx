import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import s from '@/styles/shared.module.css';
import FileUpload from '@/components/docvault/FileUpload';

export const dynamic = 'force-dynamic';

export default async function BorrowerDocumentsPage() {
    const { data: borrower, error } = await supabase
        .from('Borrower')
        .select(`
            *,
            docRequests:DocRequest(*, files:DocumentFile(*))
        `)
        .eq('status', 'active')
        .limit(1)
        .single();

    if (error || !borrower) return <div>Borrower not found</div>;

    const docRequests = (borrower.docRequests as any[] || []);
    // Manual sort
    docRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
                        {docRequests.map(dr => (
                            <tr key={dr.id}>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{dr.docType}</div>
                                    <div style={{ fontSize: 11, color: 'var(--bb-muted)' }}>{dr.category || 'General'}</div>
                                </td>
                                <td>
                                    <span className={`${s.pill} ${dr.status === 'verified' ? s.pillGreen : dr.status === 'uploaded' ? s.pillBlue : s.pillYellow}`}>
                                        {dr.status?.toUpperCase()}
                                    </span>
                                </td>
                                <td>
                                    {dr.status === 'requested' || dr.status === 'rejected' ? (
                                        <FileUpload borrowerId={borrower.id} docType={dr.docType} category={dr.category} />
                                    ) : (
                                        <div style={{ fontSize: 12 }}>{dr.files?.length || 0} file(s) attached</div>
                                    )}
                                </td>
                                <td style={{ fontSize: 12, color: 'var(--bb-muted)' }}>
                                    {new Date(dr.updatedAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
