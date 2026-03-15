import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const entityType = searchParams.get('entityType');
        const entityId = searchParams.get('entityId');

        if (!entityType || !entityId) {
            return NextResponse.json({ error: 'entityType and entityId required' }, { status: 400 });
        }

        const { data: notes, error } = await supabase
            .from('Note')
            .select('*')
            .eq('entityType', entityType)
            .eq('entityId', entityId)
            .order('createdAt', { ascending: false });

        if (error) throw error;
        return NextResponse.json(notes ?? []);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { entityType, entityId, content, createdBy } = body;

        if (!entityType || !entityId || !content) {
            return NextResponse.json({ error: 'entityType, entityId, and content required' }, { status: 400 });
        }

        const { data: note, error } = await supabase
            .from('Note')
            .insert({ entityType, entityId, content, createdBy: createdBy || 'broker' })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(note, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }
}
