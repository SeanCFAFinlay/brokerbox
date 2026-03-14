export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { logAudit } from '@/lib/audit';
import { parseBody, handleDbError } from '@/lib/api';
import { updateDealSchema } from '@/lib/schemas';
import {
  selectDealById,
  updateDeal,
  insertDealStageHistory,
} from '@/lib/supabase/queries';
import { getAdminClient, rowToApp } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deal = await selectDealById(id);
    return NextResponse.json(deal);
  } catch (err) {
    if (err instanceof Error && err.message === 'Not found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return handleDbError(err);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const raw = await req.json();
    const parsed = parseBody(updateDealSchema, raw);
    if (parsed.success === false) return parsed.response;
    const body = { ...parsed.data } as Record<string, unknown> & { changedBy?: string };
    const changedBy = body.changedBy ?? 'broker';
    const { changedBy: _drop, ...updateData } = body;
    if (
      typeof updateData.propertyValue === 'number' &&
      typeof updateData.loanAmount === 'number'
    ) {
      (updateData as Record<string, unknown>).ltv =
        (updateData.loanAmount / updateData.propertyValue) * 100;
    }

    const supabase = getAdminClient();
    const { data: oldRow } = await supabase.from('deal').select('*').eq('id', id).single();
    if (!oldRow) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const old = rowToApp(oldRow as Record<string, unknown>) as Record<string, unknown>;

    if (updateData.stage && updateData.stage !== old.stage) {
      await insertDealStageHistory({
        dealId: id,
        fromStage: old.stage as string,
        toStage: updateData.stage as string,
        changedBy,
      });
    }

    const deal = await updateDeal(id, updateData as Record<string, unknown>);

    const diff: Record<string, { old: unknown; new: unknown }> = {};
    for (const key of Object.keys(updateData)) {
      if (old[key] !== (updateData as Record<string, unknown>)[key]) {
        diff[key] = {
          old: old[key],
          new: (updateData as Record<string, unknown>)[key],
        };
      }
    }
    await logAudit('Deal', id, 'UPDATE', diff);
    return NextResponse.json(deal);
  } catch (err) {
    return handleDbError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getAdminClient();
    const { error } = await supabase.from('deal').delete().eq('id', id);
    if (error) throw error;
    await logAudit('Deal', id, 'DELETE');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleDbError(err);
  }
}
