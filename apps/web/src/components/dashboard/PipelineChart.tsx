"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import s from './PipelineChart.module.css';

interface PipelineChartProps {
    data: { stage: string; count: number; volume: number }[];
}

const STAGE_COLORS: Record<string, string> = {
    'intake': 'var(--bb-muted)',
    'submitted': 'var(--bb-warning)',
    'approved': 'var(--bb-accent)',
    'funded': 'var(--bb-success)',
    'closed': 'var(--bb-text-secondary)',
};

export function PipelineChart({ data }: PipelineChartProps) {
    const formattedData = useMemo(() => {
        return data.map(d => ({
            ...d,
            displayStage: d.stage.charAt(0).toUpperCase() + d.stage.slice(1),
            volumeM: (d.volume / 1000000).toFixed(1)
        }));
    }, [data]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={s.tooltip}>
                    <div className={s.tooltipTitle}>{label}</div>
                    <div className={s.tooltipValue}>{payload[0].payload.count} Deals</div>
                    <div className={s.tooltipDesc}>${payload[0].payload.volumeM}M Total Volume</div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={s.container}>
            <ResponsiveContainer width="100%" height={240}>
                <BarChart data={formattedData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <XAxis
                        dataKey="displayStage"
                        tick={{ fill: 'var(--bb-text-secondary)', fontSize: 13 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: 'var(--bb-text-secondary)', fontSize: 13 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bb-surface-hover)' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
                        {formattedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STAGE_COLORS[entry.stage] || 'var(--bb-accent)'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
