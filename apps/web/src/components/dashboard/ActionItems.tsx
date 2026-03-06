import React from 'react';
import Link from 'next/link';
import { AlertCircle, Clock, FileWarning } from 'lucide-react';
import s from './ActionItems.module.css';

interface ActionItem {
    id: string;
    type: 'doc_request' | 'deal_stalled' | 'system_alert';
    title: string;
    subtitle: string;
    date: Date;
    href: string;
}

export function ActionItems({ items }: { items: ActionItem[] }) {
    if (!items || items.length === 0) {
        return (
            <div className={s.empty}>
                <div className={s.emptyIcon}><AlertCircle size={32} /></div>
                <div className={s.emptyText}>You're all caught up!</div>
                <div className={s.emptySub}>No pending action items in your pipeline.</div>
            </div>
        );
    }

    return (
        <div className={s.container}>
            {items.map(item => (
                <Link key={item.id} href={item.href} className={s.item}>
                    <div className={s.iconArea}>
                        {item.type === 'doc_request' && <FileWarning size={20} className={s.iconWarning} />}
                        {item.type === 'deal_stalled' && <Clock size={20} className={s.iconAlert} />}
                        {item.type === 'system_alert' && <AlertCircle size={20} className={s.iconInfo} />}
                    </div>
                    <div className={s.content}>
                        <div className={s.title}>{item.title}</div>
                        <div className={s.subtitle}>{item.subtitle}</div>
                    </div>
                    <div className={s.time}>
                        {item.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                </Link>
            ))}
        </div>
    );
}
