import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const { data: notifications, error } = await supabase
            .from('Notification')
            .select('*')
            .eq('userId', userId)
            .order('createdAt', { ascending: false })
            .limit(20);

        if (error) throw error;
        return NextResponse.json(notifications ?? []);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { data: notification, error } = await supabase.from('Notification').insert(body).select().single();
        if (error) throw error;
        return NextResponse.json(notification, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, read } = body;
        const { data: notification, error } = await supabase.from('Notification').update({ read }).eq('id', id).select().single();
        if (error) throw error;
        return NextResponse.json(notification);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}
