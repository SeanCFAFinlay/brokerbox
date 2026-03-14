import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, rowsToApp, rowToApp, appToRow } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { syncToCalendar } from '@/lib/calendar';
import { parseBody, handleDbError } from '@/lib/api';
import { createTaskSchema } from '@/lib/schemas';
import type { TableInsert } from '@/types/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const assignedToId = searchParams.get('assignedToId');
    const status = searchParams.get('status');

    const supabase = getAdminClient();
    let q = supabase.from('task').select('*').order('due_date', { ascending: true }).order('created_at', { ascending: false });
    if (entityType) q = q.eq('entity_type', entityType);
    if (entityId) q = q.eq('entity_id', entityId);
    if (assignedToId) q = q.eq('assigned_to_id', assignedToId);
    if (status) q = q.eq('status', status);

    const { data, error } = await q;
    if (error) throw error;
    return NextResponse.json(rowsToApp(data ?? []));
  } catch (err) {
    return handleDbError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const parsed = parseBody(createTaskSchema, raw);
    if (parsed.success === false) return parsed.response;
    const d = parsed.data;
    const dueDate = d.dueDate != null ? new Date(d.dueDate as string | Date) : null;
    const row = appToRow<Record<string, unknown>>({
      title: d.title,
      description: d.description ?? null,
      dueDate: dueDate ?? null,
      status: (d.status as string) ?? 'pending',
      assignedToId: d.assignedToId ?? null,
      entityType: d.entityType ?? null,
      entityId: d.entityId ?? null,
      dealId: d.dealId ?? null,
    });
    const supabase = getAdminClient();
    const { data: taskRow, error } = await supabase.from('task').insert(row as TableInsert<'task'>).select().single();
    if (error) throw error;
    const task = rowToApp(taskRow as Record<string, unknown>) as { id: string; title: string; description?: string; dueDate?: string };

    if (task.dueDate) {
      await syncToCalendar({
        title: `Task: ${task.title}`,
        description: task.description || '',
        startTime: new Date(task.dueDate),
        eventType: 'task',
        sourceId: task.id,
        sourceType: 'Task',
      });
    }

    await logAudit('Task', task.id, 'CREATE');
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    return handleDbError(err);
  }
}
