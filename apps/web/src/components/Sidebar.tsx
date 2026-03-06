'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import styles from './Sidebar.module.css';

const NAV = [
    { label: 'Dashboard', href: '/', icon: '📊' },
    { label: 'Borrowers', href: '/borrowers', icon: '👥' },
    { label: 'Lenders', href: '/lenders', icon: '🏦' },
    { label: 'Deal Desk', href: '/deals', icon: '📋' },
    { label: 'BrokerBox Match', href: '/match', icon: '🎯' },
    { label: 'Scenario Builder', href: '/scenarios', icon: '🧮' },
    { label: 'DocVault', href: '/docvault', icon: '📁' },
    { label: 'Reports', href: '/reports', icon: '📈' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { theme, toggle } = useTheme();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoArea}>
                <span className={styles.logoIcon}>◆</span>
                <span className={styles.logoText}>BrokerBox</span>
            </div>

            <nav className={styles.nav}>
                {NAV.map(n => (
                    <Link
                        key={n.href}
                        href={n.href}
                        className={`${styles.navItem} ${pathname === n.href ? styles.active : ''}`}
                    >
                        <span className={styles.navIcon}>{n.icon}</span>
                        <span>{n.label}</span>
                    </Link>
                ))}
            </nav>

            <div className={styles.bottom}>
                <button className={styles.themeBtn} onClick={toggle}>
                    {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                </button>
                <div className={styles.user}>
                    <div className={styles.avatar}>DB</div>
                    <div>
                        <div className={styles.userName}>Demo Broker</div>
                        <div className={styles.userRole}>BrokerBox Pro</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
