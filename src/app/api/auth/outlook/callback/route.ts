import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/outlook';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    try {
        const tokens = await exchangeCodeForTokens(code);

        // Use a consistent demo user ID or fetch from session
        const userId = 'demo-user-id';

        const { error } = await supabase.from('User').update({
            outlookAccessToken: tokens.access_token,
            outlookRefreshToken: tokens.refresh_token,
            outlookTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
            outlookEnabled: true
        }).eq('id', userId);

        if (error) throw error;

        // Redirect back to settings
        return NextResponse.redirect(new URL('/settings', req.url));
    } catch (error: any) {
        console.error('Outlook OAuth Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
