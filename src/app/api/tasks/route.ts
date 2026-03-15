import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';
import { parseBody } from '@/lib/api';
import { createTaskSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const assignedToId = searchParams.get('assignedToId');
    const status = searchParams.get('status');

    let query = supabase.from('Task').select('*');

    if (entityType) query = query.eq('entityType', entityType);
    if (entityId) query = query.eq('entityId', entityId);
    if (assignedToId) query = query.eq('assignedToId', assignedToId);
    if (status) query = query.eq('status', status);

    const { data: tasks, error } = await query
      .order('dueDate', { ascending: true })
      .order('createdAt', { ascending: false });

    if (error) throw error;

    return NextResponse.json(tasks ?? []);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const parsed = parseBody(createTaskSchema, raw);
    if (parsed.success === false) return parsed.response;

    const d = parsed.data;

    const { data: task, error } = await supabase.from('Task').insert({
      title: d.title,
      description: d.description ?? null,
      dueDate: d.dueDate ? new Date(d.dueDate).toISOString() : null,
      status: d.status ?? 'pending',
      assignedToId: d.assignedToId ?? null,
      entityType: d.entityType ?? null,
      entityId: d.entityId ?? null,
      dealId: d.dealId ?? null,
    }).select().single();

    if (error) throw error;

    await logAudit('Task', task.id, 'CREATE');
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
