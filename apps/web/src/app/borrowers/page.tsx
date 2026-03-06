import prisma from '@/lib/prisma';
import Link from 'next/link';
import s from '@/styles/shared.module.css';
import BorrowerActions from './BorrowerActions';

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

            <div className={s.card}>
                <table className={s.table}>
                    <thead>
                        <tr>
                            <th>Name</th><th>Email</th><th>Province</th><th>Credit Score</th>
                            <th>Income</th><th>Deals</th><th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {borrowers.map(b => (
                            <tr key={b.id}>
                                <td><Link href={`/borrowers/${b.id}`} style={{ color: 'var(--bb-accent)', fontWeight: 600 }}>{b.firstName} {b.lastName}</Link></td>
                                <td>{b.email}</td>
                                <td>{b.province}</td>
                                <td>{b.creditScore}</td>
                                <td>${b.income.toLocaleString()}</td>
                                <td>{b._count.deals}</td>
                                <td><span className={`${s.pill} ${b.status === 'active' ? s.pillGreen : s.pillGray}`}>{b.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
