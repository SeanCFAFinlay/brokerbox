'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import s from '@/components/Sidebar.module.css';

export default function LenderSidebar() {
    const pathname = usePathname();
    const links = [
        { href: '/portal/lender', label: 'Lender Dashboard', icon: '🏦' },
        { href: '/portal/lender/deals', label: 'Deal Pipeline', icon: '📂' },
    ];

    return (
        <aside className={s.sidebar}>
            <div className={s.logo}>
                <div className={s.logoBox}>L</div>
                BrokerBox <span style={{ color: 'var(--bb-accent)', marginLeft: 4, fontWeight: 'normal', fontSize: 13 }}>Lender</span>
            </div>

            <nav className={s.nav}>
                {links.map(l => (
                    <Link key={l.href} href={l.href} className={`${s.navItem} ${pathname === l.href ? s.active : ''}`}>
                        <span className={s.icon}>{l.icon}</span>
                        {l.label}
                    </Link>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', padding: '0 20px', fontSize: 13, color: 'var(--bb-muted)' }}>
                Demo Lender Mode
                <br />
                <Link href="/" style={{ color: 'var(--bb-accent)', textDecoration: 'none', display: 'inline-block', marginTop: 8 }}>← Back to Broker CRM</Link>
            </div>
        </aside>
    );
}
