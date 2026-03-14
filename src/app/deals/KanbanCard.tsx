"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { DealType } from './KanbanBoard';
import s from './Kanban.module.css';
import { Globe, Building2, User } from 'lucide-react';

interface Props {
    deal: DealType;
}

export function KanbanCard({ deal }: Props) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: deal.id,
        data: { type: 'Deal', deal }
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className={`${s.card} ${s.dragging}`}
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={s.card}
        >
            <div className={s.cardHeader}>
                <div className={s.cardTitle}>
                    <User size={14} className={s.icon} />
                    <span>{deal.borrower.firstName} {deal.borrower.lastName}</span>
                </div>
                <div className={s.cardAmount}>
                    ${(deal.loanAmount / 1000).toFixed(0)}K
                </div>
            </div>

            <div className={s.cardBody}>
                {deal.lender ? (
                    <div className={s.lender}>
                        <Building2 size={12} className={s.icon} />
                        {deal.lender.name}
                    </div>
                ) : (
                    <div className={`${s.lender} ${s.noLender}`}>
                        No lender selected
                    </div>
                )}
            </div>

            <div className={s.cardFooter}>
                <div className={s.badge}>
                    LTV {deal.ltv ? `${deal.ltv.toFixed(1)}%` : '—'}
                </div>
                <Link href={`/deals/${deal.id}`} className={s.viewLink} onPointerDown={(e) => e.stopPropagation()}>
                    View
                </Link>
            </div>
        </div>
    );
}
