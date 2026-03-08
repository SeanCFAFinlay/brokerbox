'use client';
import Sidebar from './Sidebar';
import NotificationBell from './notifications/NotificationBell';
import { useSidebar } from './SidebarContext';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const { toggle } = useSidebar();

    return (
        <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
            <Sidebar />
            <main className="main-content">
                <header className="main-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button className="hamburger" onClick={toggle}>☰</button>
                        <h1 style={{ fontSize: 18, margin: 0, fontWeight: 700 }}>BrokerBox</h1>
                    </div>
                    <NotificationBell userId="demo-user-id" />
                </header>
                <div style={{ padding: '24px 32px' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
