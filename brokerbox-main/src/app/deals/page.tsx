import s from '@/styles/shared.module.css';
import DealActions from './DealActions';
import { KanbanBoard } from './KanbanBoard';
import DealsTableView from './DealsTableView';
import ViewToggle from './ViewToggle';
import { selectDealsWithRelations } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';

const STAGES = ['intake', 'in_review', 'matched', 'committed', 'funded', 'declined'];

export default async function DealsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
    const { view } = await searchParams;
    const currentView = view === 'table' ? 'table' : 'board';

    const deals = await selectDealsWithRelations();

    const dealsList = deals as { stage: string; loanAmount: number }[];
    const activePipeline = dealsList.filter((d) => d.stage !== 'declined' && d.stage !== 'archived');
    const totalVolume = activePipeline.reduce((sum, d) => sum + Number(d.loanAmount ?? 0), 0);

    return (
        <>
            <div className={s.pageHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Deal Pipeline</h1>
                        <p>{dealsList.length} deals · ${(Number(totalVolume) / 1e6).toFixed(1)}M pipeline</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <ViewToggle current={currentView} />
                        <DealActions />
                    </div>
                </div>
            </div>

            {currentView === 'board' ? (
                <KanbanBoard initialDeals={deals as Parameters<typeof KanbanBoard>[0]['initialDeals']} stages={STAGES} />
            ) : (
                <DealsTableView deals={deals as Parameters<typeof DealsTableView>[0]['deals']} />
            )}
        </>
    );
}
