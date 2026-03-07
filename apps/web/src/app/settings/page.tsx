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
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [saving, setSaving] = useState(false);
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

            <form onSubmit={handleSave} className={s.grid2}>
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

            {toast && <div className={`${s.toast} ${s.toastSuccess}`}>{toast}</div>}
        </>
    );
}
