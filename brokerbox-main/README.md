# BrokerBox

Mortgage broker CRM: Next.js 15 app with Supabase as the backend data layer.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Supabase** (Auth, Database, optional Realtime/Storage)
- **Vercel** (deployment)

## Quick start

```bash
pnpm install
cp .env.example .env.local   # then set Supabase env vars
pnpm dev                     # http://localhost:3000
```

## Scripts

| Command | Purpose |
|--------|--------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript check (no emit) |

## Environment variables

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` – Supabase service role key (server-only)

Optional (Outlook/Microsoft Graph):

- `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_TENANT_ID`, `AZURE_REDIRECT_URI`

See `.env.example` for the full list.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the contents of **supabase/schema.sql** to create tables, indexes, and RLS.
3. Add the project URL and keys to `.env.local` (and to Vercel for production).

Details: **supabase/README.md**.

## Vercel deployment

1. Connect the repo to Vercel.
2. Set root directory to the app root (this folder if you deploy from the repo root).
3. Build command: `pnpm run build` (or `next build`).
4. Add environment variables in Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
5. Deploy.

## Project structure

```
src/
  app/           # App Router routes and API
  components/    # React components
  lib/           # Supabase clients, db helpers, domain logic
    supabase/    # client.ts, server.ts, admin.ts, queries.ts
    db/          # snake_case ↔ camelCase mapping
  styles/
supabase/
  schema.sql     # Full DB schema
  README.md      # Supabase setup
```

## GitHub

Push to `main` to trigger CI (lint, typecheck, build). See `.github/workflows/web.yml`.

## Migration

This app was migrated from Prisma to Supabase. See **MIGRATION_REPORT.md** for what changed.
