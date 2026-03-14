"use client";
import React, { useState } from 'react';
import s from '@/styles/shared.module.css';
import { LtvGauge } from '@/components/calculators/LtvGauge';
import { PrivateFeeCalculator } from '@/components/calculators/PrivateFeeCalculator';
import { LenderRoiTable } from '@/components/calculators/LenderRoiTable';
import { HoldbackCalculator } from '@/components/calculators/HoldbackCalculator';
import { AssetMatcherUI } from '@/components/deals/AssetMatcher';
import { PrivateDealFlags } from '@/components/deals/PrivateDealFlags';
import { ExecutiveSummaryPDF } from '@/components/docs/ExecutiveSummaryPDF';
import { MobileDocUploader } from '@/components/docs/MobileDocUploader';
import { DocumentExpiryAlerts } from '@/components/docs/DocumentExpiryAlerts';
import { LegalInstructionPortal } from '@/components/docs/LegalInstructionPortal';
import { OutlookFeed } from '@/components/crm/OutlookFeed';
import { RenewalTracker } from '@/components/crm/RenewalTracker';
import { SmsDealBlast } from '@/components/crm/SmsDealBlast';
import { GlobalSearch } from '@/components/crm/GlobalSearch';
import { FollowupMonitor } from '@/components/crm/FollowupMonitor';

export default function CalculatorsPage() {
  const [loanAmout, setLoanAmount] = useState(300000);
  const [propValue, setPropValue] = useState(450000);

  const ltv = (loanAmout / propValue) * 100;

  return (
    <div className={s.page}>
      <GlobalSearch />
      <div className={s.pageHeader}>
        <h1>Private Mortgage Workbench</h1>
        <p>Advanced financial mechanics and underwriting tools for private lending.</p>
      </div>

      <div className={s.grid2}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className={s.card}>
            <div className={s.cardTitle}>Loan-to-Value (LTV) Tool</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--bb-text-secondary)', marginBottom: '4px' }}>Loan Amount</label>
                    <input type="number" value={loanAmout} onChange={e => setLoanAmount(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--bb-border)', background: 'var(--bb-bg-primary)', color: 'var(--bb-text-primary)' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--bb-text-secondary)', marginBottom: '4px' }}>Property Value</label>
                    <input type="number" value={propValue} onChange={e => setPropValue(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--bb-border)', background: 'var(--bb-bg-primary)', color: 'var(--bb-text-primary)' }} />
                </div>
            </div>
            <LtvGauge ltv={ltv} />
          </div>
          
          <AssetMatcherUI />
          <HoldbackCalculator />
          <DocumentExpiryAlerts />
          <LegalInstructionPortal />
          <OutlookFeed />
          <FollowupMonitor />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <PrivateFeeCalculator />
          <PrivateDealFlags />
          <ExecutiveSummaryPDF />
          <RenewalTracker />
          <SmsDealBlast />
          <MobileDocUploader />
          <LenderRoiTable />
        </div>
      </div>
    </div>
  );
}
