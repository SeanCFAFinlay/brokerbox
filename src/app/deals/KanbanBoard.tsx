"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { updateDealStage } from './actions';
import s from './Kanban.module.css';

export interface DealType {
    id: string;
    stage: string;
    loanAmount: number;
    borrower: { firstName: string; lastName: string };
    lender?: { name: string } | null;
    ltv?: number | null;
}

interface KanbanBoardProps {
    initialDeals: DealType[];
    stages: string[];
}

export function KanbanBoard({ initialDeals, stages }: KanbanBoardProps) {
    const [deals, setDeals] = useState<DealType[]>(Array.isArray(initialDeals) ? initialDeals : []);
    const safeStages = Array.isArray(stages) ? stages : [];
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // Keep internal state in sync if props change (e.g. from server action revalidation)
    useEffect(() => {
        setDeals(initialDeals);
    }, [initialDeals]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const activeDeal = activeId ? deals.find(d => d.id === activeId) : null;

    function handleDragStart(event: any) {
        setActiveId(event.active.id);
    }

    function handleDragOver(event: any) {
        const { active, over } = event;
        if (!over) return;
        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveDeal = active.data.current?.type === 'Deal';
        const isOverDeal = over.data.current?.type === 'Deal';
        const isOverColumn = over.data.current?.type === 'Column';

        if (!isActiveDeal) return;

        if (isActiveDeal && isOverDeal) {
            setDeals((prev) => {
                const activeIndex = prev.findIndex(t => t.id === activeId);
                const overIndex = prev.findIndex(t => t.id === overId);

                if (prev[activeIndex].stage !== prev[overIndex].stage) {
                    const newDeals = [...prev];
                    newDeals[activeIndex] = { ...newDeals[activeIndex], stage: prev[overIndex].stage };
                    return arrayMove(newDeals, activeIndex, overIndex);
                }
                return arrayMove(prev, activeIndex, overIndex);
            });
        }

        if (isActiveDeal && isOverColumn) {
            setDeals((prev) => {
                const activeIndex = prev.findIndex(t => t.id === activeId);
                const newDeals = [...prev];
                newDeals[activeIndex] = { ...newDeals[activeIndex], stage: overId };
                return arrayMove(newDeals, activeIndex, activeIndex);
            });
        }
    }

    function handleDragEnd(event: any) {
        setActiveId(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Find final stage
        const deal = deals.find(d => d.id === activeId);
        if (!deal) return;

        const finalStage = deal.stage;

        // Check if stage actually changed from DB
        const originalDeal = initialDeals.find(d => d.id === activeId);
        if (originalDeal && originalDeal.stage !== finalStage) {
            startTransition(() => {
                updateDealStage(activeId, finalStage);
            });
        }
    }

    return (
        <div className={s.board}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className={s.columnsContainer}>
                    {safeStages.map(stage => (
                        <KanbanColumn
                            key={stage}
                            stage={stage}
                            deals={deals.filter(d => d.stage === stage)}
                        />
                    ))}
                </div>
                <DragOverlay>
                    {activeDeal ? <KanbanCard deal={activeDeal} /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
