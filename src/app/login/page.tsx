'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        if (password === 'admin123') {
            document.cookie = "bb_auth=admin123; path=/; max-age=86400";
            router.push('/');
        } else {
            setError('Invalid password');
        }
    }

    return (
        <>
            <style>{`
                /* Hide sidebar and override main container padding for the login screen */
                main { margin-left: 0 !important; padding: 0 !important; display: flex; align-items: center; justify-content: center; background-color: var(--bb-bg) !important; }
                aside { display: none !important; }
            `}</style>

            <div style={{ display: 'flex', height: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: 400, padding: 32, backgroundColor: 'var(--bb-surface)', borderRadius: 12, border: '1px solid var(--bb-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--bb-text)' }}>BrokerBox</h1>
                        <p style={{ color: 'var(--bb-text-secondary)', marginTop: 8, fontSize: 14 }}>Enter the admin password to access the CRM.</p>
                    </div>
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--bb-text)', marginBottom: 8 }}>Password</label>
                            <input
                                type="password"
                                style={{ width: '100%', padding: '12px 14px', fontSize: 15, borderRadius: 8, border: '1px solid var(--bb-border)', backgroundColor: 'var(--bb-bg)', color: 'var(--bb-text)', outline: 'none' }}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        {error && <div style={{ color: 'var(--bb-danger)', fontSize: 13, textAlign: 'center' }}>{error}</div>}
                        <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: 8, backgroundColor: 'var(--bb-accent)', color: '#111827', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 8 }}>Login</button>
                    </form>
                </div>
            </div>
        </>
    );
}
