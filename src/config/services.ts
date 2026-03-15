/**
 * services.ts
 * Central source of truth for all external service configurations.
 */

export const SERVICES = {
    SUPABASE: {
        URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    OUTLOOK: {
        CLIENT_ID: process.env.AZURE_AD_CLIENT_ID,
        CLIENT_SECRET: process.env.AZURE_CLIENT_SECRET,
        TENANT_ID: process.env.AZURE_TENANT_ID,
        REDIRECT_URI: process.env.AZURE_REDIRECT_URI || 'http://localhost:3000/api/auth/outlook/callback',
    },
    APP: {
        URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        PORT: process.env.API_PORT || '3001',
    }
};

export default SERVICES;
