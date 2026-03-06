"use client";

import React, { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { DealType } from './KanbanBoard';
import s from './Kanban.module.css';

interface Props {
    stage: string;
    deals: DealType[];
}

export function KanbanColumn({ stage, deals }: Props) {
    const dealIds = useMemo(() => deals.map(d => d.id), [deals]);
    const stageTotal = deals.reduce((sum, d) => sum + d.loanAmount, 0);

    const { setNodeRef } = useSortable({
        id: stage,
        data: { type: 'Column', stage }
    });

    return (
        <div className={s.column} ref={setNodeRef}>
            <div className={s.columnHeader}>
                <div className={s.columnTitle}>{stage.toUpperCase()}</div>
                <div className={s.columnMeta}>
                    <span className={s.countBadge}>{deals.length}</span>
                    <span className={s.volume}>${(stageTotal / 1000).toFixed(0)}K</span>
                </div>
            </div>

            <div className={s.cardList}>
                <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
                    {deals.map(deal => (
                        <KanbanCard key={deal.id} deal={deal} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
}
