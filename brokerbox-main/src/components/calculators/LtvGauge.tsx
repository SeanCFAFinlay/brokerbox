"use client";
import React from 'react';

interface LtvGaugeProps {
  ltv: number;
}

export function LtvGauge({ ltv }: LtvGaugeProps) {
  const getColor = (v: number) => {
    if (v > 75) return '#ef4444'; // Red
    if (v > 65) return '#eab308'; // Yellow
    return '#22c55e'; // Green
  };

  const color = getColor(ltv);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', background: 'var(--bb-bg-secondary)', borderRadius: '12px', border: '1px solid var(--bb-border)' }}>
      <div style={{ position: 'relative', width: '200px', height: '100px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          border: '12px solid var(--bb-border)',
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent',
          transform: 'rotate(225deg)'
        }} />
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          border: '12px solid ' + color,
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent',
          transform: `rotate(${225 + (ltv * 1.8)}deg)`,
          transition: 'transform 0.5s ease-out'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '24px',
          fontWeight: 'bold',
          color: color
        }}>
          {ltv.toFixed(1)}%
        </div>
      </div>
      <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: '500', color: 'var(--bb-text-secondary)' }}>
        Current Loan-to-Value
      </div>
    </div>
  );
}
