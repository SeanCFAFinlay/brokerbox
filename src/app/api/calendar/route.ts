import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data: events, error } = await supabase
            .from('CalendarEvent')
            .select('*')
            .eq('status', 'active')
            .order('startTime', { ascending: true });

        if (error) throw error;
        return NextResponse.json(events ?? []);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
    }
}
