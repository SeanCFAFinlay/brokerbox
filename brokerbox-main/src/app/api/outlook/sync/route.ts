import { NextRequest, NextResponse } from 'next/server';
import { syncToOutlook } from '@/lib/outlook';

export async function POST(req: NextRequest) {
    // In a real app, get current authenticated user ID
    // For demo, we'll take it from body or a default
    const body = await req.json();
    const userId = body.userId;

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    try {
        const result = await syncToOutlook(userId);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
