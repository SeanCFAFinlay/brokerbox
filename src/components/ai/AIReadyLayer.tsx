import s from '@/styles/shared.module.css';

export default async function AIUnderwritingLayout({ children }: { children: React.ReactNode }) {
    // This is a placeholder for the AI context provider and hook infrastructure
    // Phase 3O: Architecture refactor to support future generative AI underwriting hooks

    return (
        <div data-ai-ready="true">
            {children}
            <div id="ai-assistant-shortcut" style={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                width: 48,
                height: 48,
                borderRadius: 24,
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                opacity: 0.8,
                transition: 'opacity 0.2s',
                zIndex: 9999
            }}>
                <span style={{ fontSize: 20 }}>✨</span>
            </div>
        </div>
    );
}
