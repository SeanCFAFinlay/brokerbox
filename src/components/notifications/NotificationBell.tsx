'use client';
import { useState, useEffect } from 'react';
import s from '@/styles/shared.module.css';

interface Notification {
    id: string;
    title: string;
    message: string;
    read: boolean;
    type: string;
    link?: string;
    createdAt: string;
}

export default function NotificationBell({ userId }: { userId: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!userId) return;
        fetch(`/api/notifications?userId=${userId}`)
            .then(r => r.json())
            .then(setNotifications)
            .catch(console.error);
    }, [userId]);

    const unreadCount = notifications.filter(n => !n.read).length;

    async function markAsRead(id: string) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, read: true })
        });
    }

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'none', border: 'none', cursor: 'pointer', position: 'relative',
                    fontSize: 20, color: 'var(--bb-text-secondary)', padding: 8
                }}
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: 4, right: 4, background: 'var(--bb-danger)',
                        color: '#fff', borderRadius: '50%', width: 16, height: 16,
                        fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: 44, right: 0, width: 320, background: 'var(--bb-bg-secondary)',
                    border: '1px solid var(--bb-border)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    zIndex: 1000, maxHeight: 400, overflowY: 'auto'
                }}>
                    <div style={{ padding: 16, borderBottom: '1px solid var(--bb-border)', fontWeight: 600 }}>Notifications</div>
                    {notifications.length === 0 ? (
                        <div style={{ padding: 24, textAlign: 'center', color: 'var(--bb-muted)', fontSize: 13 }}>No new notifications</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => markAsRead(n.id)}
                                    style={{
                                        padding: 12, borderBottom: '1px solid var(--bb-border)', cursor: 'pointer',
                                        background: n.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{n.title}</div>
                                        <div style={{ fontSize: 10, color: 'var(--bb-muted)' }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--bb-text-secondary)' }}>{n.message}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
