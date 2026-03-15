import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import s from '@/styles/shared.module.css';
import FileUpload from '@/components/docvault/FileUpload';

export const dynamic = 'force-dynamic';

export default async function BorrowerPortalDashboard() {
    // Mock authentication: pick the first active borrower
    const { data: borrower, error } = await supabase
        .from('Borrower')
        .select(`
            *,
            deals:Deal(*, lender:Lender(*)),
            docRequests:DocRequest(*, files:DocumentFile(*))
        `)
        .eq('status', 'active')
        .limit(1)
        .single();

    if (error || !borrower) {
        return <div style={{ padding: 40 }}><h2>Borrower Profile Not Found</h2><Link href="/borrowers">Go to Borrowers</Link></div>;
    }

    // Manual sort and Filter Fix guards
    const deals = Array.isArray(borrower.deals) ? borrower.deals : [];
    const docRequests = Array.isArray(borrower.docRequests) ? borrower.docRequests : [];

    deals.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    docRequests.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const pendingDocs = docRequests.filter((dr: any) => dr.status === 'requested');

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
            <div className={s.pageHeader}>
                <div>
                    <h1>Hello, {borrower.firstName}</h1>
                    <p>Track your mortgage application status and upload documents securely.</p>
                </div>
            </div>

            <div className={s.grid2}>
                {/* Active Deals / Applications */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className={s.card}>
                        <div className={s.cardTitle}>My Applications</div>
                        {deals.length === 0 ? (
                            <div className={s.emptyState}>No active mortgage applications found.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {deals.map(deal => (
                                    <div key={deal.id} style={{ border: '1px solid var(--bb-border)', borderRadius: 12, padding: 20 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                            <div style={{ fontWeight: 700, fontSize: 16 }}>{deal.propertyAddress || 'Unnamed Application'}</div>
                                            <span className={`${s.pill} ${deal.stage === 'funded' ? s.pillGreen : deal.stage === 'committed' ? s.pillBlue : s.pillYellow}`}>
                                                {deal.stage?.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 14, color: 'var(--bb-muted)', marginBottom: 16 }}>
                                            Loan: ${deal.loanAmount?.toLocaleString()} · {deal.lender?.name || 'In Matching Phase'}
                                        </div>

                                        {/* Status Stepper */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: 8 }}>
                                            <div style={{ position: 'absolute', top: 10, left: '10%', right: '10%', height: 2, background: 'var(--bb-border)', zIndex: 0 }}></div>
                                            {['intake', 'in_review', 'matched', 'funded'].map((st, i) => {
                                                const stages = ['intake', 'in_review', 'matched', 'committed', 'funded'];
                                                const currentIndex = stages.indexOf(deal.stage);
                                                const isCompleted = currentIndex >= stages.indexOf(st);
                                                return (
                                                    <div key={st} style={{ position: 'relative', zIndex: 1, textAlign: 'center', flex: 1 }}>
                                                        <div style={{
                                                            width: 20, height: 20, borderRadius: 10, background: isCompleted ? 'var(--bb-success)' : 'var(--bb-bg-secondary)',
                                                            border: '2px solid' + (isCompleted ? 'var(--bb-success)' : 'var(--bb-border)'),
                                                            margin: '0 auto 8px'
                                                        }}></div>
                                                        <div style={{ fontSize: 10, color: isCompleted ? 'var(--bb-text)' : 'var(--bb-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{st.replace('_', ' ')}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Outstanding Documents */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className={s.card}>
                        <div className={s.cardTitle}>Document Checklist</div>
                        <p style={{ fontSize: 13, color: 'var(--bb-muted)', marginBottom: 20 }}>
                            Please upload the following documents to continue your application.
                        </p>

                        {pendingDocs.length === 0 ? (
                            <div className={s.emptyState}>All documents verified! ✅</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {pendingDocs.map(dr => (
                                    <div key={dr.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, border: '1px solid var(--bb-border)', borderRadius: 8 }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 14 }}>{dr.docType}</div>
                                            <div style={{ fontSize: 11, color: 'var(--bb-muted)', textTransform: 'uppercase' }}>{dr.category}</div>
                                        </div>
                                        <FileUpload
                                            borrowerId={borrower.id}
                                            docType={dr.docType}
                                            category={dr.category}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <hr style={{ border: 'none', borderTop: '1px solid var(--bb-border)', margin: '20px 0' }} />
                        <Link href="/portal/borrower/documents" style={{ display: 'block', textAlign: 'center', color: 'var(--bb-accent)', fontSize: 14 }}>View All Documents & History</Link>
                    </div>

                    <div className={s.card}>
                        <div className={s.cardTitle}>Contact My Broker</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 24, background: 'var(--bb-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👩‍💼</div>
                            <div>
                                <div style={{ fontWeight: 600 }}>BrokerBox Financial</div>
                                <div style={{ fontSize: 13, color: 'var(--bb-muted)' }}>support@brokerbox.ca</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
