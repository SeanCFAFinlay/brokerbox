import { supabase } from './supabase';

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

    // Standardize duration to 1 hour if not provided
    const end = endTime || new Date(startTime.getTime() + 60 * 60 * 1000);

    const { data, error } = await supabase.from('CalendarEvent').upsert({
        id: `cal_${sourceType}_${sourceId}`,
        title,
        description,
        startTime: startTime.toISOString(),
        endTime: end.toISOString(),
        eventType,
        sourceId,
        sourceType,
    }).select().single();

    if (error) throw error;
    return data;
}

export async function removeCalendarEvent(sourceId: string, sourceType: string) {
    try {
        await supabase.from('CalendarEvent').delete().eq('id', `cal_${sourceType}_${sourceId}`);
    } catch (e) {
        // Ignore if doesn't exist
    }
}
