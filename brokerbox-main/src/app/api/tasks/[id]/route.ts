import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, rowToApp, appToRow } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { parseBody, handleDbError } from '@/lib/api';
import { updateTaskSchema } from '@/lib/schemas';
import type { TableUpdate } from '@/types/supabase';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const raw = await req.json();
    const parsed = parseBody(updateTaskSchema, raw);
    if (parsed.success === false) return parsed.response;
    const d = parsed.data;
    const dueDate = d.dueDate != null ? new Date(d.dueDate as string | Date) : undefined;
    const data: Record<string, unknown> = {
      ...(d.title !== undefined && { title: d.title }),
      ...(d.description !== undefined && { description: d.description }),
      ...(dueDate !== undefined && { due_date: dueDate.toISOString() }),
      ...(d.status !== undefined && { status: d.status }),
      ...(d.priority !== undefined && { priority: d.priority }),
      ...(d.assignedToId !== undefined && { assigned_to_id: d.assignedToId }),
      ...(d.entityType !== undefined && { entity_type: d.entityType }),
      ...(d.entityId !== undefined && { entity_id: d.entityId }),
    };

    const supabase = getAdminClient();
    const { data: oldRow } = await supabase.from('task').select('*').eq('id', resolvedParams.id).single();
    if (!oldRow) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const row = appToRow<Record<string, unknown>>(data);
    const { data: updated, error } = await supabase.from('task').update(row as TableUpdate<'task'>).eq('id', resolvedParams.id).select().single();
    if (error) throw error;
    const task = rowToApp(updated as Record<string, unknown>);

    const oldTask = rowToApp(oldRow as Record<string, unknown>) as Record<string, unknown>;
    const diff: Record<string, { old: unknown; new: unknown }> = {};
    for (const [k, v] of Object.entries(data)) {
      const camelKey = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      if (oldTask[camelKey] !== v) {
        diff[camelKey] = { old: oldTask[camelKey], new: v };
      }
    }
    await logAudit('Task', (task as { id: string }).id, 'UPDATE', diff);
    return NextResponse.json(task);
  } catch (err) {
    return handleDbError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const supabase = getAdminClient();
    const { error } = await supabase.from('task').delete().eq('id', resolvedParams.id);
    if (error) throw error;
    await logAudit('Task', resolvedParams.id, 'DELETE');
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleDbError(err);
  }
}
