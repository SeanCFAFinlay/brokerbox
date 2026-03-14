"use client";
import React, { useState, useEffect } from 'react';
import { calculateLenderROI } from '@/lib/domain';

export function LenderRoiTable() {
  const [loanAmount, setLoanAmount] = useState(150000);
  const [rate, setRate] = useState(10);
  const [fee, setFee] = useState(2);
  const [term, setTerm] = useState(12);

  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const res = calculateLenderROI({
        loanAmount,
        interestRate: rate,
        lenderFee: fee,
        termMonths: term,
        servicingFee: 1
    });
    setResults(res);
  }, [loanAmount, rate, fee, term]);

  if (!results) return null;

  return (
    <div style={{ padding: '20px', background: 'var(--bb-bg-secondary)', borderRadius: '12px', border: '1px solid var(--bb-border)' }}>
      <h3>Lender ROI Calculator</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
        <span>Annualized ROI</span>
        <span style={{ fontWeight: 'bold', color: 'var(--bb-success)' }}>{results.roi.toFixed(2)}%</span>
      </div>
    </div>
  );
}
