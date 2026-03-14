'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import s from '@/styles/shared.module.css';

export default function ApplyMatchButton({ dealId, borrowerId, lenderId }: { dealId: string, borrowerId: string, lenderId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleApply() {
        setLoading(true);
        try {
            const res = await fetch('/api/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dealId,
                    borrowerId,
                    applyToDeal: true,
                    selectedLenderId: lenderId
                })
            });
            if (res.ok) {
                router.refresh();
            }
        } catch (err) {
            console.error('Failed to apply match:', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`}
            style={{ padding: '4px 8px', fontSize: 11 }}
            onClick={handleApply}
            disabled={loading}
        >
            {loading ? 'Applying...' : 'Select'}
        </button>
    );
}
