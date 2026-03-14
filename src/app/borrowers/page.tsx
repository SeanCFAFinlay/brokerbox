import prisma from '@/lib/prisma';
import s from '@/styles/shared.module.css';
import BorrowerActions from './BorrowerActions';
import BorrowerTable from './BorrowerTable';

export const dynamic = 'force-dynamic';

export default async function BorrowersPage() {
    const borrowers = await prisma.borrower.findMany({
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { deals: true } } },
    });

    return (
        <>
            <div className={s.pageHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Borrowers</h1>
                        <p>{borrowers.length} borrowers in your CRM</p>
                    </div>
                    <BorrowerActions />
                </div>
            </div>

            <BorrowerTable borrowers={borrowers as any} />
        </>
    );
}
