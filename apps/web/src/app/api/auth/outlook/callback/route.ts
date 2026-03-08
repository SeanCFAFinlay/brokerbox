import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/outlook';
import prisma from '@/lib/prisma';

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

        await prisma.user.update({
            where: { id: userId },
            data: {
                outlookAccessToken: tokens.access_token,
                outlookRefreshToken: tokens.refresh_token,
                outlookTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
                outlookEnabled: true
            }
        });

        // Redirect back to settings
        return NextResponse.redirect(new URL('/settings', req.url));
    } catch (error: any) {
        console.error('Outlook OAuth Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
