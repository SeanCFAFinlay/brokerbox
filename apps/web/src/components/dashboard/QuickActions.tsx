import React from 'react';
import Link from 'next/link';
import { PlusCircle, FileText, LayoutDashboard, Calculator } from 'lucide-react';
import s from './QuickActions.module.css';

export function QuickActions() {
    const actions = [
        { label: 'New Borrower', href: '/borrowers?new=true', icon: PlusCircle, color: 'var(--bb-accent)' },
        { label: 'Add Deal', href: '/deals?new=true', icon: LayoutDashboard, color: 'var(--bb-success)' },
        { label: 'Run Scenario', href: '/scenarios?new=true', icon: Calculator, color: 'var(--bb-warning)' },
        { label: 'Request Docs', href: '/docvault?new=true', icon: FileText, color: 'var(--bb-text)' },
    ];

    return (
        <div className={s.grid}>
            {actions.map((act, i) => {
                const Icon = act.icon;
                return (
                    <Link key={i} href={act.href} className={s.card}>
                        <div className={s.iconWrapper} style={{ backgroundColor: `${act.color}15`, color: act.color }}>
                            <Icon size={24} />
                        </div>
                        <span className={s.label}>{act.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
