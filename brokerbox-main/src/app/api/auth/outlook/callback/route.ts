import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/outlook';
import { getAdminClient } from '@/lib/db';
import { appToRow } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const userId = 'demo-user-id';
    const supabase = getAdminClient();
    const row = appToRow<Record<string, unknown>>({
      outlookAccessToken: tokens.access_token,
      outlookRefreshToken: tokens.refresh_token,
      outlookTokenExpiry: new Date(Date.now() + (tokens.expires_in ?? 0) * 1000),
      outlookEnabled: true,
    });
    await supabase.from('user').update(row).eq('id', userId);
    return NextResponse.redirect(new URL('/settings', req.url));
  } catch (err) {
    const e = err as Error;
    console.error('Outlook OAuth Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
