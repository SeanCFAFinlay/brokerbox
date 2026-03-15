'use client';

import React, { useState } from 'react';
import { calculateLTV } from '@/lib/domain';
import s from '@/styles/shared.module.css';

export function LtvCalculator() {
  const [propertyValue, setPropertyValue] = useState(1000000);
  const [loanAmount, setLoanAmount] = useState(750000);
  const [existingLiens, setExistingLiens] = useState(0);

  const totalExposure = loanAmount + existingLiens;
  const ltv = calculateLTV(totalExposure, propertyValue);

  return (
    <div className={s.grid2}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className={s.formGroup}>
          <label className={s.formLabel}>Estimated Property Value ($)</label>
          <input type="number" className={s.formInput} value={propertyValue} onChange={e => setPropertyValue(Number(e.target.value))} />
        </div>
        <div className={s.formGroup}>
          <label className={s.formLabel}>Requested Loan Amount ($)</label>
          <input type="number" className={s.formInput} value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))} />
        </div>
        <div className={s.formGroup}>
          <label className={s.formLabel}>Existing Liens (if 2nd/3rd) ($)</label>
          <input type="number" className={s.formInput} value={existingLiens} onChange={e => setExistingLiens(Number(e.target.value))} />
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bb-surface-hover)', padding: 24, borderRadius: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <div style={{ fontSize: 13, color: 'var(--bb-text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Loan-to-Value (Exposure)</div>
                <div style={{ fontSize: 48, fontWeight: 700, color: ltv > 75 ? 'var(--bb-danger)' : 'var(--bb-success)' }}>{ltv.toFixed(1)}%</div>
                <div style={{ fontSize: 13, color: 'var(--bb-text-secondary)', marginTop: 8 }}>Primary Target &lt; 75.0%</div>
            </div>
        </div>
      </div>
    </div>
  );
}
