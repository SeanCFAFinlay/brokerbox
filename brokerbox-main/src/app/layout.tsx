import type { Metadata } from 'next';
import '@/styles/globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import { SidebarProvider } from '@/components/SidebarContext';
import MainLayout from '@/components/MainLayout';

export const metadata: Metadata = {
  title: 'BrokerBox – Mortgage Broker CRM',
  description: 'Enterprise mortgage broker CRM with lender matching, scenario analysis, and document management.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="theme-dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SidebarProvider>
            <MainLayout>{children}</MainLayout>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
