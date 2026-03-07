import prisma from '@/lib/prisma';
import s from '@/styles/shared.module.css';
import DealActions from './DealActions';
import { KanbanBoard } from './KanbanBoard';
import DealsTableView from './DealsTableView';
import ViewToggle from './ViewToggle';

export const dynamic = 'force-dynamic';

const STAGES = ['intake', 'in_review', 'matched', 'committed', 'funded', 'declined'];

export default async function DealsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
    const { view } = await searchParams;
    const currentView = view === 'table' ? 'table' : 'board';

    const deals = await prisma.deal.findMany({
        orderBy: { updatedAt: 'desc' },
        include: { borrower: true, lender: true },
    });

    const activePipeline = deals.filter(d => d.stage !== 'declined' && d.stage !== 'archived');
    const totalVolume = activePipeline.reduce((sum, d) => sum + d.loanAmount, 0);

    return (
        <>
            <div className={s.pageHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Deal Pipeline</h1>
                        <p>{deals.length} deals · ${(totalVolume / 1e6).toFixed(1)}M pipeline</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <ViewToggle current={currentView} />
                        <DealActions />
                    </div>
                </div>
            </div>

            {currentView === 'board' ? (
                <KanbanBoard initialDeals={deals as any} stages={STAGES} />
            ) : (
                <DealsTableView deals={deals as any} />
            )}
        </>
    );
}
