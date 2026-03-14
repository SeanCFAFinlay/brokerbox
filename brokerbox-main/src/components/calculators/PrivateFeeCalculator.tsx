"use client";
import React, { useState } from 'react';
import { calculateCommission } from '@/lib/domain';

export function PrivateFeeCalculator() {
  const [loanAmount, setLoanAmount] = useState(250000);
  const res = calculateCommission({
    loanAmount,
    lenderBps: 100,
    brokerBps: 50,
    flatFees: 995,
    splitPercentage: 50
  });

  return (
    <div style={{ padding: '20px', background: 'var(--bb-bg-secondary)', borderRadius: '12px', border: '1px solid var(--bb-border)' }}>
      <h3>Private Fee & Commission</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
        <span>Agent Take-Home</span>
        <span style={{ color: 'var(--bb-success)', fontWeight: '600' }}>${res.agentSplit.toLocaleString()}</span>
      </div>
    </div>
  );
}
