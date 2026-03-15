'use client';

import { useState, useEffect } from 'react';

interface LtvGaugeProps {
  loanAmount: number;
  propertyValue: number;
  showEquityBreakdown?: boolean;
}

export function LtvGauge({ loanAmount, propertyValue, showEquityBreakdown = true }: LtvGaugeProps) {
  const [mounted, setMounted] = useState(false);

  // Hydration guard — prevents SSR/client mismatch
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div style={{ height: 80 }} />;

  if (!propertyValue || propertyValue === 0) {
    return <div style={{ color: 'var(--bb-muted)', fontSize: 13 }}>Property value required</div>;
  }

  const ltv = (loanAmount / propertyValue) * 100;
  const clampedLtv = Math.min(ltv, 100);
  const equityDollars = propertyValue - loanAmount;
  const equityPct = 100 - ltv;

  // Equity Risk color logic: > 75% LTV = Red (high risk), 65–75% = Yellow, < 65% = Green
  const color = ltv > 75 ? '#ef4444' : ltv >= 65 ? '#f59e0b' : '#22c55e';
  const riskLabel = ltv > 75 ? 'High Risk' : ltv >= 65 ? 'Moderate' : 'Conservative';
  const bgTrack = 'rgba(255,255,255,0.06)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--bb-muted)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
          Equity Risk
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{ltv.toFixed(1)}%</span>
          <span style={{ fontSize: 11, color: 'var(--bb-muted)' }}>LTV</span>
        </div>
      </div>

      {/* Gauge bar */}
      <div style={{ position: 'relative', height: 10, background: bgTrack, borderRadius: 5, overflow: 'hidden' }}>
        <div style={{
          width: `${clampedLtv}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}cc, ${color})`,
          borderRadius: 5,
          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
        {/* 75% threshold marker */}
        <div style={{
          position: 'absolute', top: -2, bottom: -2, left: '75%',
          width: 2, background: 'var(--bb-danger)', opacity: 0.5,
        }} />
      </div>

      {/* Risk label + breakdown */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, alignItems: 'center' }}>
        <span style={{
          color, fontWeight: 700, background: `${color}18`,
          padding: '2px 8px', borderRadius: 4, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          {riskLabel}
        </span>
        {showEquityBreakdown && (
          <span style={{ color: 'var(--bb-muted)' }}>
            Equity: ${equityDollars.toLocaleString()} ({equityPct.toFixed(1)}%)
          </span>
        )}
      </div>
    </div>
  );
}
