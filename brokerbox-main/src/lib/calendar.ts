import { getAdminClient } from '@/lib/db';
import { appToRow, rowToApp } from '@/lib/db';

export async function syncToCalendar(params: {
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  eventType: 'task' | 'condition' | 'closing' | 'renewal';
  sourceId: string;
  sourceType: 'Task' | 'Deal' | 'DealCondition';
}) {
  const { title, description, startTime, endTime, eventType, sourceId, sourceType } = params;
  const end = endTime || new Date(startTime.getTime() + 60 * 60 * 1000);
  const id = `cal_${sourceType}_${sourceId}`;

  const supabase = getAdminClient();
  const row = appToRow<Record<string, unknown>>({
    id,
    title,
    description: description ?? null,
    startTime,
    endTime: end,
    eventType,
    sourceId,
    sourceType,
  });

  const { data, error } = await supabase
    .from('calendar_event')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return rowToApp(data);
}

export async function removeCalendarEvent(sourceId: string, sourceType: string) {
  const supabase = getAdminClient();
  await supabase.from('calendar_event').delete().eq('id', `cal_${sourceType}_${sourceId}`);
}
