import prisma from '@/lib/prisma';
import s from '@/styles/shared.module.css';
import LenderActions from './LenderActions';
import LenderTable from './LenderTable';

export const dynamic = 'force-dynamic';

export default async function LendersPage() {
    const lenders = await prisma.lender.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { deals: true } } },
    });

    const totalCapital = lenders.reduce((sum, l) => sum + l.capitalAvailable, 0);

    return (
        <>
            <div className={s.pageHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Lenders</h1>
                        <p>{lenders.length} lenders in your network · ${(totalCapital / 1e6).toFixed(1)}M available capital</p>
                    </div>
                    <LenderActions />
                </div>
            </div>

            <LenderTable lenders={lenders as any} />
        </>
    );
}
