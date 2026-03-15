import { supabase } from '@/lib/supabase';
import s from '@/styles/shared.module.css';
import BorrowerActions from './BorrowerActions';
import BorrowerTable from './BorrowerTable';

export const dynamic = 'force-dynamic';

export default async function BorrowersPage() {
    const { data: borrowers, error } = await supabase
        .from('Borrower')
        .select('*, deals:Deal(count)')
        .order('updatedAt', { ascending: false });

    // Map counts to a consistent structure for the table component
    const formattedBorrowers = (Array.isArray(borrowers) ? borrowers : []).map(b => ({
        ...b,
        _count: { deals: (b.deals as any || [])[0]?.count || 0 }
    }));

    return (
        <>
            <div className={s.pageHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Borrowers</h1>
                        <p>{formattedBorrowers.length} borrowers in your CRM</p>
                    </div>
                    <BorrowerActions />
                </div>
            </div>

            <BorrowerTable borrowers={formattedBorrowers as any} />
        </>
    );
}
