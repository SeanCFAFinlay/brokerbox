import prisma from './prisma';

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

    return await prisma.calendarEvent.upsert({
        where: { id: `cal_${sourceType}_${sourceId}` }, // Deterministic ID for syncing
        update: {
            title,
            description,
            startTime,
            endTime: end,
            eventType,
            sourceId,
            sourceType,
        },
        create: {
            id: `cal_${sourceType}_${sourceId}`,
            title,
            description,
            startTime,
            endTime: end,
            eventType,
            sourceId,
            sourceType,
        }
    });
}

export async function removeCalendarEvent(sourceId: string, sourceType: string) {
    try {
        await prisma.calendarEvent.delete({
            where: { id: `cal_${sourceType}_${sourceId}` }
        });
    } catch (e) {
        // Ignore if doesn't exist
    }
}
