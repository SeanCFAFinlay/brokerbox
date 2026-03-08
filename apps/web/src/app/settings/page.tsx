'use client';
import { useState, useEffect } from 'react';
import s from '@/styles/shared.module.css';

interface Settings {
    brokerageName: string;
    licenseNumber: string;
    principalBroker: string;
    officeAddress: string;
    officePhone: string;
    officeEmail: string;
    defaultBrokerFee: number;
    defaultLenderFee: number;
    defaultTermMonths: number;
    defaultAmortMonths: number;
    defaultInterestRate: number;
    outlookEnabled: boolean;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        fetch('/api/settings').then(r => r.json()).then(setSettings);
    }, []);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const res = await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        setSaving(false);
        if (res.ok) {
            setToast('Settings saved successfully!');
            setTimeout(() => setToast(''), 3000);
        }
    }

    if (!settings) return <div style={{ padding: 24, color: 'var(--bb-muted)' }}>Loading settings...</div>;

    function update(field: keyof Settings, value: any) {
        setSettings(prev => prev ? { ...prev, [field]: value } : null);
    }

    return (
        <>
            <div className={s.pageHeader}>
                <h1>⚙️ Settings</h1>
                <p>Configure brokerage profile and default application parameters</p>
            </div>

            <div className={s.grid2}>
                <div className={s.card}>
                    <div className={s.cardTitle}>📅 Calendar Integration</div>
                    <p style={{ fontSize: 13, color: 'var(--bb-text-secondary)', marginBottom: 20 }}>
                        Sync your deal closings and task deadlines directly to your Microsoft Outlook calendar.
                    </p>
                    <div style={{ padding: 16, background: 'var(--bb-bg)', borderRadius: 8, border: '1px solid var(--bb-border)', marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>Microsoft Outlook</div>
                                <div style={{ fontSize: 12, color: settings.outlookEnabled ? '#22c55e' : 'var(--bb-muted)' }}>
                                    {settings.outlookEnabled ? 'Connected' : 'Not Connected'}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => window.location.href = '/api/auth/outlook'}
                                className={`${s.btn} ${settings.outlookEnabled ? s.btnSecondary : s.btnPrimary}`}
                            >
                                {settings.outlookEnabled ? 'Reconnect' : 'Connect Outlook'}
                            </button>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} style={{ display: 'contents' }}>
                    <div className={s.card}>
                        <div className={s.cardTitle}>Brokerage Profile</div>
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Brokerage Name</label>
                            <input className={s.formInput} value={settings.brokerageName} onChange={e => update('brokerageName', e.target.value)} required />
                        </div>
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>License Number</label>
                            <input className={s.formInput} value={settings.licenseNumber} onChange={e => update('licenseNumber', e.target.value)} />
                        </div>
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Principal Broker</label>
                            <input className={s.formInput} value={settings.principalBroker} onChange={e => update('principalBroker', e.target.value)} />
                        </div>
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Office Address</label>
                            <input className={s.formInput} value={settings.officeAddress} onChange={e => update('officeAddress', e.target.value)} />
                        </div>
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Office Phone</label>
                            <input className={s.formInput} value={settings.officePhone} onChange={e => update('officePhone', e.target.value)} />
                        </div>
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Office Email</label>
                            <input className={s.formInput} type="email" value={settings.officeEmail} onChange={e => update('officeEmail', e.target.value)} />
                        </div>
                    </div>

                    <div className={s.card}>
                        <div className={s.cardTitle}>Default Deal Parameters</div>
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Default Broker Fee (%)</label>
                            <input type="number" step="0.01" className={s.formInput} value={settings.defaultBrokerFee} onChange={e => update('defaultBrokerFee', e.target.value)} />
                        </div>
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Default Lender Fee (%)</label>
                            <input type="number" step="0.01" className={s.formInput} value={settings.defaultLenderFee} onChange={e => update('defaultLenderFee', e.target.value)} />
                        </div>
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Default Term (Months)</label>
                            <input type="number" className={s.formInput} value={settings.defaultTermMonths} onChange={e => update('defaultTermMonths', e.target.value)} />
                        </div>
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Default Amortization (Months)</label>
                            <input type="number" className={s.formInput} value={settings.defaultAmortMonths} onChange={e => update('defaultAmortMonths', e.target.value)} />
                        </div>
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Default Interest Rate (%)</label>
                            <input type="number" step="0.01" className={s.formInput} value={settings.defaultInterestRate} onChange={e => update('defaultInterestRate', e.target.value)} />
                        </div>

                        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" className={`${s.btn} ${s.btnPrimary}`} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {toast && <div className={`${s.toast} ${s.toastSuccess}`}>{toast}</div>}
        </>
    );
}
