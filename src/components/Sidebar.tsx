'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { useSidebar } from '@/components/SidebarContext';
import styles from '@/styles/Sidebar.module.css';

const NAV = [
    { label: 'Dashboard', href: '/', icon: '📊' },
    { label: 'Pipeline', href: '/pipeline', icon: '🏦' },
    { label: 'Borrowers', href: '/borrowers', icon: '👥' },
    { label: 'Lenders', href: '/lenders', icon: '🏦' },
    { label: 'Deal Desk', href: '/deals', icon: '📋' },
    { label: 'BrokerBox Match', href: '/match', icon: '🎯' },
    { label: 'Scenario Builder', href: '/scenarios', icon: '🧮' },
    { label: 'Calculators', href: '/calculators', icon: '🔢' },
    { label: 'DocVault', href: '/docvault', icon: '📁' },
    { label: 'FundFlow', href: '/fundflow', icon: '💰' },
    { label: 'Reports', href: '/reports', icon: '📈' },
    { label: 'Loans', href: '/loans', icon: '💰' },
    { label: 'Settings', href: '/settings', icon: '⚙️' },
    { label: 'Users', href: '/users', icon: '🧑‍💻' },
];

interface SearchResult {
    id: string;
    type: 'deal' | 'borrower';
    label: string;
    sub: string;
    href: string;
}

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, mounted, toggle: toggleTheme } = useTheme();
    const { isOpen, close } = useSidebar();

    // ─── Search State ─────────────────────────────────────────
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowResults(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Debounced Supabase search
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!query || query.length < 2) {
            setResults([]);
            setShowResults(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                // Dynamic import to avoid bundling supabase in the sidebar chunk unnecessarily
                const { supabase } = await import('@/lib/supabase');

                const [{ data: deals }, { data: borrowers }] = await Promise.all([
                    supabase
                        .from('Deal')
                        .select('id, propertyAddress, loanAmount, stage')
                        .or(`propertyAddress.ilike.%${query}%,stage.ilike.%${query}%`)
                        .limit(5),
                    supabase
                        .from('Borrower')
                        .select('id, firstName, lastName, email')
                        .or(`firstName.ilike.%${query}%,lastName.ilike.%${query}%,email.ilike.%${query}%`)
                        .limit(5),
                ]);

                const mapped: SearchResult[] = [
                    ...(Array.isArray(deals) ? deals : []).map(d => ({
                        id: d.id,
                        type: 'deal' as const,
                        label: d.propertyAddress || `Deal $${(d.loanAmount || 0).toLocaleString()}`,
                        sub: d.stage?.replace('_', ' ') || 'unknown',
                        href: `/deals/${d.id}`,
                    })),
                    ...(Array.isArray(borrowers) ? borrowers : []).map(b => ({
                        id: b.id,
                        type: 'borrower' as const,
                        label: `${b.firstName} ${b.lastName}`,
                        sub: b.email || '',
                        href: `/borrowers/${b.id}`,
                    })),
                ];

                setResults(mapped);
                setShowResults(mapped.length > 0);
            } catch {
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [query]);

    function handleResultClick(href: string) {
        setQuery('');
        setShowResults(false);
        close();
        router.push(href);
    }

    return (
        <>
            {isOpen && <div className={styles.overlay} onClick={close} />}
            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.logoArea}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                        <span className={styles.logoIcon}>◆</span>
                        <span className={styles.logoText}>BrokerBox</span>
                    </div>
                    <button className={styles.closeBtn} onClick={close}>✕</button>
                </div>

                {/* ── Search Bar ── */}
                <div ref={searchRef} style={{ padding: '0 16px 12px', position: 'relative' }}>
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onFocus={() => results.length > 0 && setShowResults(true)}
                        placeholder="Search deals & borrowers..."
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: '1px solid var(--bb-border)',
                            background: 'var(--bb-bg-secondary)',
                            color: 'var(--bb-text)',
                            fontSize: 13,
                            outline: 'none',
                        }}
                    />
                    {searching && (
                        <div style={{ position: 'absolute', right: 24, top: 8, fontSize: 11, color: 'var(--bb-muted)' }}>
                            Searching...
                        </div>
                    )}

                    {/* Results dropdown */}
                    {showResults && (
                        <div style={{
                            position: 'absolute', top: '100%', left: 16, right: 16, zIndex: 50,
                            background: 'var(--bb-surface, var(--bb-bg))',
                            border: '1px solid var(--bb-border)',
                            borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                            maxHeight: 300, overflowY: 'auto',
                        }}>
                            {results.map(r => (
                                <button
                                    key={`${r.type}-${r.id}`}
                                    onClick={() => handleResultClick(r.href)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                                        padding: '10px 14px', border: 'none', background: 'transparent',
                                        color: 'var(--bb-text)', cursor: 'pointer', textAlign: 'left',
                                        borderBottom: '1px solid var(--bb-border)', fontSize: 13,
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bb-bg-secondary)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <span style={{ fontSize: 16 }}>{r.type === 'deal' ? '📋' : '👤'}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</div>
                                        <div style={{ fontSize: 11, color: 'var(--bb-muted)', textTransform: 'capitalize' }}>{r.sub}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
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
                    <button className={styles.themeBtn} onClick={toggleTheme}>
                        {!mounted ? '...' : (theme === 'dark' ? '☀️ Light' : '🌙 Dark')}
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
        </>
    );
}
