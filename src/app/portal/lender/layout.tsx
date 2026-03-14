import LenderSidebar from './LenderSidebar';
import s from '@/styles/shared.module.css';

export default function LenderPortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={s.appLayout}>
            <LenderSidebar />
            <main className={s.mainContent}>
                {children}
            </main>
        </div>
    );
}
