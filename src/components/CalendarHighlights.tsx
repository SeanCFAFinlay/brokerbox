'use client';
import { useEffect, useState } from 'react';
import s from '@/styles/shared.module.css';

interface CalendarEvent {
    id: string;
    title: string;
    startTime: string;
    eventType: string;
}

export default function CalendarHighlights({ dealId }: { dealId: string }) {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all events and filter for this deal
        fetch('/api/calendar')
            .then(res => res.json())
            .then(data => {
                const filtered = data.filter((e: any) =>
                    (e.sourceType === 'Deal' && e.sourceId === dealId) ||
                    (e.sourceType === 'Task' && e.sourceId.includes(dealId)) // Simplified check
                );
                setEvents(filtered);
                setLoading(false);
            });
    }, [dealId]);

    if (loading) return <div style={{ fontSize: 13, color: 'var(--bb-muted)' }}>Loading milestones...</div>;
    if (events.length === 0) return <div className={s.emptyState} style={{ padding: 12 }}>No upcoming milestones.</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {events.map(event => (
                <div key={event.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bb-bg)', borderRadius: 8 }}>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{event.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--bb-muted)', textTransform: 'uppercase' }}>{event.eventType}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{new Date(event.startTime).toLocaleDateString()}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
