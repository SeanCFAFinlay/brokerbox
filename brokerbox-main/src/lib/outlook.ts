import { getAdminClient } from '@/lib/db';
import { rowToApp, rowsToApp } from '@/lib/db';
import type { TableUpdate } from '@/types/supabase';

const CLIENT_ID = process.env.AZURE_CLIENT_ID;
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;
const REDIRECT_URI = process.env.AZURE_REDIRECT_URI || 'http://localhost:3000/api/auth/outlook/callback';

export function getAuthUrl() {
  const scopes = ['offline_access', 'User.Read', 'Calendars.ReadWrite', 'Tasks.ReadWrite'];
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_mode=query&scope=${encodeURIComponent(scopes.join(' '))}`;
}

export async function exchangeCodeForTokens(code: string) {
  const res = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Token exchange failed: ${JSON.stringify(err)}`);
  }

  return res.json();
}

export async function refreshAccessToken(userId: string, refreshToken: string) {
  const res = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) throw new Error('Refresh token exchange failed');
  const tokens = await res.json();

  const supabase = getAdminClient();
  const updatePayload: TableUpdate<'user'> = {
    outlook_access_token: tokens.access_token,
    outlook_refresh_token: tokens.refresh_token || refreshToken,
    outlook_token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
  };
  const { error } = await supabase.from('user').update(updatePayload).eq('id', userId);
  if (error) throw error;

  return tokens.access_token;
}

export async function syncToOutlook(userId: string) {
  const supabase = getAdminClient();
  const { data: userRow } = await supabase.from('user').select('*').eq('id', userId).single();
  if (!userRow?.outlook_refresh_token) return;

  const user = rowToApp<{
    outlookAccessToken?: string;
    outlookRefreshToken?: string;
    outlookTokenExpiry?: string;
  }>(userRow);

  let token = user.outlookAccessToken;
  if (
    !token ||
    (user.outlookTokenExpiry && new Date(user.outlookTokenExpiry) < new Date())
  ) {
    token = await refreshAccessToken(userId, user.outlookRefreshToken!);
  }

  const { data: dealsData } = await supabase
    .from('deal')
    .select('*, borrower(*)')
    .not('closing_date', 'is', null);
  const deals = rowsToApp(dealsData || []);

  for (const deal of deals as { id: string; closingDate?: string; propertyAddress?: string; borrower?: { firstName: string; lastName: string } }[]) {
    try {
      await fetch('https://graph.microsoft.com/v1.0/me/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: `Closing: ${deal.borrower?.firstName ?? ''} ${deal.borrower?.lastName ?? ''}`,
          body: {
            contentType: 'HTML',
            content: `BrokerBox Closing for ${deal.propertyAddress || 'No Address'}.`,
          },
          start: {
            dateTime: deal.closingDate ? new Date(deal.closingDate).toISOString() : null,
            timeZone: 'UTC',
          },
          end: {
            dateTime: deal.closingDate
              ? new Date(new Date(deal.closingDate).getTime() + 3600000).toISOString()
              : null,
            timeZone: 'UTC',
          },
        }),
      });
    } catch (e) {
      console.error('Failed to sync deal to Outlook:', deal.id, e);
    }
  }

  return { success: true, timestamp: new Date() };
}
