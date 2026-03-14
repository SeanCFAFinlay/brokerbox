"use client";
import React, { useState } from 'react';
import { matchLenders, CollateralType } from '@/lib/domain/AssetMatcher';

export function AssetMatcherUI() {
  const [collateral, setCollateral] = useState<CollateralType>('residential');
  const results = matchLenders(collateral, 75);

  return (
    <div style={{ padding: '20px', background: 'var(--bb-bg-secondary)', borderRadius: '12px', border: '1px solid var(--bb-border)' }}>
      <h3>Asset Matcher</h3>
      <div style={{ marginTop: '12px' }}>{results.length} Lenders Match</div>
    </div>
  );
}
