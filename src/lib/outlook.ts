import { supabase } from './supabase';

const CLIENT_ID = process.env.AZURE_AD_CLIENT_ID;
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
            grant_type: 'authorization_code'
        })
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
            grant_type: 'refresh_token'
        })
    });

    if (!res.ok) throw new Error('Refresh token exchange failed');
    const tokens = await res.json();

    const { error } = await supabase.from('User').update({
        outlookAccessToken: tokens.access_token,
        outlookRefreshToken: tokens.refresh_token || refreshToken,
        outlookTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    }).eq('id', userId);

    if (error) throw error;

    return tokens.access_token;
}

export async function syncToOutlook(userId: string) {
    const { data: user, error: userError } = await supabase.from('User').select('*').eq('id', userId).single();
    if (userError || !user || !user.outlookRefreshToken) return;

    let token = user.outlookAccessToken;
    if (!token || (user.outlookTokenExpiry && new Date(user.outlookTokenExpiry) < new Date())) {
        console.log(`Refreshing Outlook token for user ${userId}...`);
        token = await refreshAccessToken(userId, user.outlookRefreshToken);
    }

    // Fetch deals with closing dates
    const { data: deals, error: dealsError } = await supabase.from('Deal').select('*, borrower:Borrower(*)').not('closingDate', 'is', null);
    if (dealsError || !deals) return;

    for (const deal of deals) {
        try {
            // Push to Microsoft Graph: POST /me/events
            await fetch('https://graph.microsoft.com/v1.0/me/events', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.outlookAccessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject: `Closing: ${deal.borrower.firstName} ${deal.borrower.lastName}`,
                    body: {
                        contentType: 'HTML',
                        content: `BrokerBox Closing for ${deal.propertyAddress || 'No Address'}.`
                    },
                    start: {
                        dateTime: deal.closingDate,
                        timeZone: 'UTC'
                    },
                    end: {
                        dateTime: new Date(new Date(deal.closingDate).getTime() + 3600000).toISOString(),
                        timeZone: 'UTC'
                    }
                })
            });
        } catch (e) {
            console.error('Failed to sync deal to Outlook:', deal.id, e);
        }
    }

    console.log(`Syncing data for user ${userId} to Outlook COMPLETE.`);
    return { success: true, timestamp: new Date() };
}
