'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, CheckCircle } from 'lucide-react';

// Attempting to match the project's visual language by pulling in the shared module
import s from '@/styles/shared.module.css';

interface DealData {
  id: string;
  stage: string;
  loanAmount: number;
}

interface CommandCenterProps {
  deals: DealData[];
}

const STAGES = ['intake', 'in_review', 'matched', 'committed', 'funded'];
const STAGE_LABELS: Record<string, string> = {
  intake: 'Lead / Intake',
  in_review: 'Underwriting',
  matched: 'Matched',
  committed: 'Committed',
  funded: 'Funded',
};

// Colors matching the dashboard's semantic style
const COLORS = ['#6366f1', '#3b82f6', '#0ea5e9', '#10b981', '#22c55e'];

export function PipelineCommandCenter({ deals }: CommandCenterProps) {
  const aggregatedData = useMemo(() => {
    return STAGES.map((stage) => {
      const stageDeals = deals.filter(d => d.stage === stage);
      const volume = stageDeals.reduce((sum, d) => sum + (d.loanAmount || 0), 0);
      return {
        stage,
        name: STAGE_LABELS[stage] || stage,
        count: stageDeals.length,
        volume,
      };
    });
  }, [deals]);

  const totalVolume = aggregatedData.reduce((sum, d) => sum + d.volume, 0);
  const fundedVolume = aggregatedData.find(d => d.stage === 'funded')?.volume || 0;
  const activeDeals = deals.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI Header Row */}
      <div className={s.grid2} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div className={s.kpiCard}>
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
             <div className={s.kpiLabel}>Total Pipeline Volume</div>
             <Activity size={16} style={{ color: 'var(--bb-text-secondary)' }} />
           </div>
           <div className={s.kpiValue}>${(totalVolume / 1e6).toFixed(2)}M</div>
           <div className={s.kpiSub}>{activeDeals} Active Deals</div>
        </div>
        
        <div className={s.kpiCard}>
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
             <div className={s.kpiLabel}>Funded Volume</div>
             <CheckCircle size={16} style={{ color: 'var(--bb-success)' }} />
           </div>
           <div className={s.kpiValue}>${(fundedVolume / 1e6).toFixed(2)}M</div>
           <div className={s.kpiSub}>Successfully closed</div>
        </div>
      </div>

      {/* Main Visualization Board */}
      <div className={s.card}>
        <div className={s.cardTitle}>Command Center: Stage Volume</div>
        <p style={{ color: 'var(--bb-text-secondary)', fontSize: 13, marginBottom: 24 }}>
          Analyze aggregate capital flowing through your pipeline stages.
        </p>
        
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <BarChart data={aggregatedData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bb-border)" />
              <XAxis 
                dataKey="name" 
                stroke="var(--bb-text-secondary)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dy={10} 
              />
              <YAxis 
                stroke="var(--bb-text-secondary)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `$${(val / 1e6).toPrecision(2)}M`}
              />
              <Tooltip 
                cursor={{ fill: 'var(--bb-surface-hover)' }}
                contentStyle={{ 
                  backgroundColor: 'var(--bb-surface)', 
                  borderColor: 'var(--bb-border)', 
                  borderRadius: 8, 
                  color: 'var(--bb-text)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Volume']}
              />
              <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                {aggregatedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
