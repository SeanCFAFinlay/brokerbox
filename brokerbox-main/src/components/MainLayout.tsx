'use client';
import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useSidebar } from '@/components/SidebarContext';
import s from '@/styles/MainLayout.module.css';

export default function MainLayout({ children, userId = "demo" }: { children: React.ReactNode, userId?: string }) {
    const { toggle } = useSidebar();

    return (
        <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
            <Sidebar />
            <main className={s.mainContent}>
                <header className={s.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button className={s.hamburger} onClick={toggle}>☰</button>
                        <h1 style={{ fontSize: 18, margin: 0, fontWeight: 700 }}>BrokerBox</h1>
                    </div>
                    <NotificationBell userId={userId} />
                </header>
                <div style={{ padding: '24px 32px' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
