import prisma from '@/lib/prisma';
import Link from 'next/link';
import s from '@/styles/shared.module.css';
import { CapitalPoolManager } from '@/components/lender/CapitalPoolManager';

export const dynamic = 'force-dynamic';

export default async function LenderCapitalPage() {
    const lender = await prisma.lender.findFirst({
        where: { status: 'active' },
        include: {
            capitalPools: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!lender) return <div style={{ padding: 40 }}><h2>Lender Access Restricted</h2></div>;

    const pools = lender.capitalPools.map(p => ({
        ...p,
        utilizationRate: p.utilizationRate || 0
    }));

    const totalManaged = pools.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalAvailable = pools.reduce((sum, p) => sum + p.availableAmount, 0);
    const avgLTV = pools.length > 0 ? pools.reduce((sum, p) => sum + p.effectiveLTV, 0) / pools.length : 0;

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
            <div className={s.pageHeader}>
                <div>
                    <h1>Lending Capital & Pools</h1>
                    <p>Strategic management of {lender.name}'s capital lifecycle and utilization.</p>
                </div>
            </div>

            <CapitalPoolManager initialPools={pools as any} lenderId={lender.id} />
        </div>
    );
}
