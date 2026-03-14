import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { logAudit } from '@/lib/audit'

const TABLE = 'Task'

function handleSupabaseError(error: unknown) {
  console.error(error)
  return NextResponse.json(
    { error: 'Supabase request failed' },
    { status: 500 }
  )
}

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = getAdminClient()

    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .single()

    if (error) return handleSupabaseError(error)
    return NextResponse.json(data)
  } catch (err) {
    return handleSupabaseError(err)
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await req.json()
    const supabase = getAdminClient()

    const { data, error } = await supabase
      .from(TABLE)
      .update(body)
      .eq('id', id)
      .select('*')
      .single()

    if (error) return handleSupabaseError(error)

    await logAudit('Task', id, 'UPDATE')
    return NextResponse.json(data)
  } catch (err) {
    return handleSupabaseError(err)
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = getAdminClient()

    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id)

    if (error) return handleSupabaseError(error)

    await logAudit('Task', id, 'DELETE')
    return NextResponse.json({ success: true })
  } catch (err) {
    return handleSupabaseError(err)
  }
}
