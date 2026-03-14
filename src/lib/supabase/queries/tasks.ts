import { getAdminClient } from '@/lib/supabase/admin'

const TABLE = 'Task'

export async function listTasks(filters?: {
  entityType?: string | null
  entityId?: string | null
  assignedToId?: string | null
  status?: string | null
}) {
  const supabase = getAdminClient()
  let query = supabase.from(TABLE).select('*')

  if (filters?.entityType && filters?.entityId) {
    query = query.eq('entityType', filters.entityType).eq('entityId', filters.entityId)
  }

  if (filters?.assignedToId) {
    query = query.eq('assignedToId', filters.assignedToId)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  query = query.order('dueDate', { ascending: true }).order('createdAt', { ascending: false })

  return query
}

export async function createTask(data: {
  title: string
  description?: string | null
  dueDate?: string | Date | null
  status?: 'pending' | 'completed'
  assignedToId?: string | null
  entityType?: string | null
  entityId?: string | null
  dealId?: string | null
}) {
  const supabase = getAdminClient()

  const payload = {
    title: data.title,
    description: data.description ?? null,
    dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
    status: data.status ?? 'pending',
    assignedToId: data.assignedToId ?? null,
    entityType: data.entityType ?? null,
    entityId: data.entityId ?? null,
    dealId: data.dealId ?? null,
  }

  return supabase.from(TABLE).insert(payload).select('*').single()
}
