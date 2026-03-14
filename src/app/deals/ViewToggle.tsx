'use client';
import { useRouter } from 'next/navigation';
import s from '@/styles/shared.module.css';

export default function ViewToggle({ current }: { current: 'board' | 'table' }) {
    const router = useRouter();

    return (
        <div className={s.tabs} style={{ marginBottom: 0 }}>
            <button
                className={`${s.tab} ${current === 'board' ? s.tabActive : ''}`}
                onClick={() => router.push('/deals?view=board')}
            >
                📋 Board
            </button>
            <button
                className={`${s.tab} ${current === 'table' ? s.tabActive : ''}`}
                onClick={() => router.push('/deals?view=table')}
            >
                📊 Table
            </button>
        </div>
    );
}
