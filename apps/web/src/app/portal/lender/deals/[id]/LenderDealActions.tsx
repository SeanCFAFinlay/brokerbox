'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import s from '@/styles/shared.module.css';

export default function LenderDealActions({ dealId, stage }: { dealId: string, stage: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [condText, setCondText] = useState('');

    async function changeStage(newStage: string) {
        setLoading(true);
        await fetch(`/api/deals/${dealId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stage: newStage })
        });
        router.refresh();
        setLoading(false);
    }

    async function addCondition(e: React.FormEvent) {
        e.preventDefault();
        if (!condText.trim()) return;
        setLoading(true);
        await fetch('/api/conditions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dealId, description: condText })
        });
        setCondText('');
        router.refresh();
        setLoading(false);
    }

    return (
        <div className={s.card}>
            <div className={s.cardTitle}>Lender Actions</div>
            <p style={{ fontSize: 13, color: 'var(--bb-muted)', marginBottom: 16 }}>
                Update the deal&apos;s lifecycle stage or request stipulations from the broker.
            </p>

            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                {stage !== 'committed' && stage !== 'funded' && (
                    <button className={`${s.btn}`} style={{ background: 'var(--bb-success)', color: '#fff', border: 'none' }} onClick={() => changeStage('committed')} disabled={loading}>
                        Approve (Commit)
                    </button>
                )}
                {stage === 'committed' && (
                    <button className={`${s.btn}`} style={{ background: 'var(--bb-success)', color: '#fff', border: 'none' }} onClick={() => changeStage('funded')} disabled={loading}>
                        Mark as Funded
                    </button>
                )}
                <button className={`${s.btn} ${s.btnDanger}`} onClick={() => changeStage('declined')} disabled={loading || stage === 'declined'}>
                    Decline
                </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--bb-border)', margin: '24px 0' }} />

            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Request Stipulation (Condition)</div>
            <form onSubmit={addCondition} style={{ display: 'flex', gap: 12 }}>
                <input
                    type="text"
                    className={s.formInput}
                    placeholder="e.g. Provide updated paystub..."
                    value={condText}
                    onChange={e => setCondText(e.target.value)}
                    style={{ flex: 1 }}
                    disabled={loading}
                />
                <button type="submit" className={`${s.btn} ${s.btnSecondary}`} disabled={loading || !condText.trim()}>Add</button>
            </form>
        </div>
    );
}
