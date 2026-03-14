'use client';
import { useEffect, useState } from 'react';
import s from '@/styles/shared.module.css';

interface AuditEntry {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    actorName: string;
    diff: any;
    metadata: any;
    timestamp: string;
}

export default function AuditTimeline({ entityType, entityId }: { entityType: string, entityId: string }) {
    const [logs, setLogs] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/audit?entityType=${entityType}&entityId=${entityId}`)
            .then(res => res.json())
            .then(data => {
                setLogs(data);
                setLoading(false);
            });
    }, [entityType, entityId]);

    if (loading) return <div className={s.emptyState}>Loading activity...</div>;
    if (logs.length === 0) return <div className={s.emptyState}>No activity logged yet.</div>;

    const getActionColor = (action: string) => {
        const a = action.toUpperCase();
        if (a.includes('CREATE')) return 'var(--bb-success)';
        if (a.includes('DELETE')) return 'var(--bb-danger)';
        if (a.includes('MATCH')) return 'var(--bb-accent)';
        if (a.includes('CONDITION')) return 'var(--bb-warning)';
        return 'var(--bb-muted)';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {logs.map(log => (
                <div key={log.id} style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                    <div style={{ width: 4, background: getActionColor(log.action), borderRadius: 2 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong style={{ color: 'var(--bb-text)' }}>{log.action.replace('_', ' ')}</strong>
                            <span style={{ fontSize: 11, color: 'var(--bb-muted)' }}>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <div style={{ color: 'var(--bb-text-secondary)', marginTop: 2 }}>
                            {log.actorName && <span style={{ marginRight: 8, fontWeight: 600 }}>{log.actorName}:</span>}
                            {log.metadata?.notes || log.metadata?.reason || (log.diff ? 'State updated' : 'System automated action')}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
