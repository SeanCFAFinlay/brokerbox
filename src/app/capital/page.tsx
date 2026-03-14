import prisma from '@/lib/prisma';
import s from '@/styles/shared.module.css';
import CapitalPoolClient from './CapitalPoolClient';

export const dynamic = 'force-dynamic';

export default async function CapitalPage() {
    const pools = await prisma.capitalPool.findMany({
        include: {
            lender: true,
            investments: { include: { user: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    const activeLenders = await prisma.lender.findMany({ where: { status: 'active' } });
    const investors = await prisma.user.findMany({ where: { role: 'investor' } });

    const totalCapital = pools.reduce((sum, p) => sum + p.totalAmount, 0);
    const activeCapital = pools.reduce((sum, p) => sum + p.availableAmount, 0);
    const deployedCapital = totalCapital - activeCapital;
    const utilization = totalCapital > 0 ? (deployedCapital / totalCapital) * 100 : 0;

    return (
        <div style={{ padding: '0 20px', maxWidth: 1400, margin: '0 auto' }}>
            <div className={s.pageHeader}>
                <div>
                    <h1>🏦 Capital & Investors</h1>
                    <p>Manage capital pools, investor commitments, and active pipeline deployments</p>
                </div>
            </div>

            <div className={s.kpiRow} style={{ marginBottom: 32 }}>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Total Pool Capital</div>
                    <div className={s.kpiValue}>${totalCapital.toLocaleString()}</div>
                </div>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Deployed</div>
                    <div className={s.kpiValue}>${deployedCapital.toLocaleString()}</div>
                </div>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Utilization</div>
                    <div className={s.kpiValue}>{utilization.toFixed(1)}%</div>
                </div>
                <div className={s.kpiCard}>
                    <div className={s.kpiLabel}>Active Investors</div>
                    <div className={s.kpiValue}>{investors.length}</div>
                </div>
            </div>

            {/* Client Component handles Modals/Forms and state mapping */}
            <CapitalPoolClient initialPools={pools} lenders={activeLenders} investors={investors} />
        </div>
    );
}
