import type { Metadata } from 'next';
import '@/styles/globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/notifications/NotificationBell';

export const metadata: Metadata = {
  title: 'BrokerBox – Mortgage Broker CRM',
  description: 'Enterprise mortgage broker CRM with lender matching, scenario analysis, and document management.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="theme-dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{ flex: 1, marginLeft: 260, background: 'var(--bb-bg)', minHeight: '100vh' }}>
              <header style={{
                height: 64, borderBottom: '1px solid var(--bb-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                padding: '0 32px', position: 'sticky', top: 0, background: 'var(--bb-bg)', zIndex: 900
              }}>
                <NotificationBell userId="demo-user-id" />
              </header>
              <div style={{ padding: '24px 32px' }}>
                {children}
              </div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
