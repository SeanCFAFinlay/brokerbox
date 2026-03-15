import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: investors, error } = await supabase
            .from('User')
            .select('id, name, email')
            .eq('role', 'investor');

        if (error) throw error;
        return NextResponse.json(investors ?? []);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch investors' }, { status: 500 });
    }
}
