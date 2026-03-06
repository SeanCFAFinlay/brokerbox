import type { Metadata } from 'next';
import '@/styles/globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import Sidebar from '@/components/Sidebar';

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
            <main style={{ flex: 1, marginLeft: 260, padding: '24px 32px', background: 'var(--bb-bg)', minHeight: '100vh' }}>
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
