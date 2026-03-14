'use client';

import React, { useState } from 'react';
import { calculateGDS, calculateTDS } from '@/lib/domain';
import s from '@/styles/shared.module.css';

export function GdsTdsCalculator() {
  const [grossIncome, setGrossIncome] = useState(120000);
  const [mortgagePayment, setMortgagePayment] = useState(3500);
  const [propertyTaxes, setPropertyTaxes] = useState(400);
  const [heating, setHeating] = useState(150);
  const [condoFees, setCondoFees] = useState(0);
  const [otherDebts, setOtherDebts] = useState(600);

  const input = {
    principal: mortgagePayment,
    interest: 0,
    taxes: propertyTaxes,
    heat: heating,
    condoFees,
    otherDebt: otherDebts,
    grossIncome,
  };
  const gds = calculateGDS(input);
  const tds = calculateTDS(input);

  return (
    <div className={s.grid2}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className={s.formGroup}>
          <label className={s.formLabel}>Annual Gross Income ($)</label>
          <input type="number" className={s.formInput} value={grossIncome} onChange={e => setGrossIncome(Number(e.target.value))} />
        </div>
        <div className={s.formGroup}>
          <label className={s.formLabel}>Monthly Mortgage Payment ($)</label>
          <input type="number" className={s.formInput} value={mortgagePayment} onChange={e => setMortgagePayment(Number(e.target.value))} />
        </div>
        <div className={s.grid2}>
            <div className={s.formGroup}>
            <label className={s.formLabel}>Property Tax/mo</label>
            <input type="number" className={s.formInput} value={propertyTaxes} onChange={e => setPropertyTaxes(Number(e.target.value))} />
            </div>
            <div className={s.formGroup}>
            <label className={s.formLabel}>Heating/mo</label>
            <input type="number" className={s.formInput} value={heating} onChange={e => setHeating(Number(e.target.value))} />
            </div>
        </div>
        <div className={s.grid2}>
            <div className={s.formGroup}>
            <label className={s.formLabel}>Condo Fees/mo</label>
            <input type="number" className={s.formInput} value={condoFees} onChange={e => setCondoFees(Number(e.target.value))} />
            </div>
            <div className={s.formGroup}>
            <label className={s.formLabel}>Other Debts/mo</label>
            <input type="number" className={s.formInput} value={otherDebts} onChange={e => setOtherDebts(Number(e.target.value))} />
            </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bb-surface-hover)', padding: 24, borderRadius: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--bb-border)' }}>
            <div>
                <div style={{ fontSize: 13, color: 'var(--bb-text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Gross Debt Service</div>
                <div style={{ fontSize: 48, fontWeight: 700, color: gds > 39 ? 'var(--bb-danger)' : 'var(--bb-success)' }}>{gds.toFixed(1)}%</div>
                <div style={{ fontSize: 13, color: 'var(--bb-text-secondary)', marginTop: 8 }}>Target &lt; 39%</div>
            </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <div style={{ fontSize: 13, color: 'var(--bb-text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Total Debt Service</div>
                <div style={{ fontSize: 48, fontWeight: 700, color: tds > 44 ? 'var(--bb-danger)' : 'var(--bb-success)' }}>{tds.toFixed(1)}%</div>
                <div style={{ fontSize: 13, color: 'var(--bb-text-secondary)', marginTop: 8 }}>Target &lt; 44%</div>
            </div>
        </div>
      </div>
    </div>
  );
}
