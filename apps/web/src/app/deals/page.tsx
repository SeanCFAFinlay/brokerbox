import prisma from '@/lib/prisma';
import s from '@/styles/shared.module.css';
import DealActions from './DealActions';
import { KanbanBoard } from './KanbanBoard';

export const dynamic = 'force-dynamic';

export default async function DealsPage() {
    const deals = await prisma.deal.findMany({
        orderBy: { updatedAt: 'desc' },
        include: { borrower: true, lender: true },
    });

    const stages = ['intake', 'submitted', 'approved', 'funded', 'closed'];

    return (
        <>
            <div className={s.pageHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Deal Pipeline</h1>
                        <p>{deals.length} deals actively managed</p>
                    </div>
                    <DealActions />
                </div>
            </div>

            <KanbanBoard initialDeals={deals as any} stages={stages} />
        </>
    );
}
