import prisma from '@/lib/prisma';
import Link from 'next/link';
import s from '@/styles/shared.module.css';
import LenderActions from './LenderActions';

export const dynamic = 'force-dynamic';

export default async function LendersPage() {
    const lenders = await prisma.lender.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { deals: true } } },
    });

    return (
        <>
            <div className={s.pageHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Lenders</h1>
                        <p>{lenders.length} lenders in your network</p>
                    </div>
                    <LenderActions />
                </div>
            </div>

            <div className={s.card}>
                <table className={s.table}>
                    <thead>
                        <tr>
                            <th>Name</th><th>Min Credit</th><th>Max LTV</th><th>Max GDS</th>
                            <th>Max TDS</th><th>Base Rate</th><th>Provinces</th><th>Deals</th><th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lenders.map(l => (
                            <tr key={l.id}>
                                <td><Link href={`/lenders/${l.id}`} style={{ color: 'var(--bb-accent)', fontWeight: 600 }}>{l.name}</Link></td>
                                <td>{l.minCreditScore}</td>
                                <td>{l.maxLTV}%</td>
                                <td>{l.maxGDS}%</td>
                                <td>{l.maxTDS}%</td>
                                <td>{l.baseRate}%</td>
                                <td>{l.supportedProvinces.join(', ')}</td>
                                <td>{l._count.deals}</td>
                                <td><span className={`${s.pill} ${l.status === 'active' ? s.pillGreen : s.pillGray}`}>{l.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
