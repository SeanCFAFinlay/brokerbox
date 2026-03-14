/**
 * Database access via Supabase (replaces Prisma).
 * Use getAdminClient() for server-side route handlers and server actions.
 * Tables and columns in Supabase are snake_case; use rowToApp/rowsToApp for camelCase.
 */

export { getAdminClient, createAdminClient } from './supabase/admin';
export { rowToApp, rowsToApp, appToRow } from './db/map';
