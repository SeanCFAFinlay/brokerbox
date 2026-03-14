import { NextRequest, NextResponse } from 'next/server'
import { logAudit } from '@/lib/audit'
import { syncToCalendar } from '@/lib/calendar'
import { parseBody } from '@/lib/api'
import { createTaskSchema } from '@/lib/schemas'
import { createTask, listTasks } from '@/lib/supabase/queries/tasks'

function handleSupabaseError(error: unknown) {
  console.error(error)
  return NextResponse.json(
    { error: 'Supabase request failed' },
    { status: 500 }
  )
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')
    const assignedToId = searchParams.get('assignedToId')
    const status = searchParams.get('status')

    const { data, error } = await listTasks({
      entityType,
      entityId,
      assignedToId,
      status,
    })

    if (error) return handleSupabaseError(error)

    return NextResponse.json(data ?? [])
  } catch (err) {
    return handleSupabaseError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json()
    const parsed = parseBody(createTaskSchema, raw)
    if (parsed.success === false) return parsed.response

    const d = parsed.data

    const { data: task, error } = await createTask({
      title: d.title,
      description: d.description ?? null,
      dueDate: d.dueDate ?? null,
      status: (d.status as 'pending' | 'completed') ?? 'pending',
      assignedToId: d.assignedToId ?? null,
      entityType: d.entityType ?? null,
      entityId: d.entityId ?? null,
      dealId: d.dealId ?? null,
    })

    if (error) return handleSupabaseError(error)
    if (!task) {
      return NextResponse.json({ error: 'Task was not created' }, { status: 500 })
    }

    if (task.dueDate) {
      await syncToCalendar({
        title: `Task: ${task.title}`,
        description: task.description || '',
        startTime: new Date(task.dueDate),
        eventType: 'task',
        sourceId: task.id,
        sourceType: 'Task',
      })
    }

    await logAudit('Task', task.id, 'CREATE')
    return NextResponse.json(task, { status: 201 })
  } catch (err) {
    return handleSupabaseError(err)
  }
}
