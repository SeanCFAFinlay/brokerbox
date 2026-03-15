import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const entityType = searchParams.get('entityType');
        const entityId = searchParams.get('entityId');

        if (!entityType || !entityId) {
            return NextResponse.json({ error: 'entityType and entityId are required' }, { status: 400 });
        }

        const { data: logs, error } = await supabase
            .from('DealActivity')
            .select('*')
            .eq('entity', entityType)
            .eq('entityId', entityId)
            .order('timestamp', { ascending: false })
            .limit(50);

        if (error) throw error;
        return NextResponse.json(logs ?? []);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
    }
}
