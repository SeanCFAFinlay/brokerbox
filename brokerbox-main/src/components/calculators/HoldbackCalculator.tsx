"use client";
import React, { useState } from 'react';
import { calculateInterestHoldback } from '@/lib/domain';

export function HoldbackCalculator() {
  const [loanAmount, setLoanAmount] = useState(200000);
  const [months, setMonths] = useState(6);
  const holdback = calculateInterestHoldback(loanAmount, 12, months);

  return (
    <div style={{ padding: '20px', background: 'var(--bb-bg-secondary)', borderRadius: '12px', border: '1px solid var(--bb-border)' }}>
      <h3>Interest Holdback Logic</h3>
      <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '12px' }}>${holdback.toLocaleString()}</div>
    </div>
  );
}
