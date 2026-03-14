# Migration Report: Prisma → Supabase

## Summary

The BrokerBox repo was fully migrated from Prisma to Supabase. The app is now a single Next.js 15 application using Supabase as the only backend data layer, with no monorepo structure.

---

## What was removed

- **Prisma**
  - `prisma/` directory (schema, seed, duplicate nested `prisma/prisma/` folder)
  - `@prisma/client` and `prisma` from package.json
  - `src/lib/prisma.ts` and Prisma usage from `src/lib/db.ts`
  - All `prisma.*` and `import prisma from '@/lib/prisma'` usage across the codebase
  - Scripts: `db:generate`, `db:push`, `postinstall` (Prisma generate)
- **Build/config**
  - `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` from next.config.mjs
- **Env**
  - `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET` (Prisma/legacy) from docs; Supabase vars are the source of truth

---

## What was changed

### Architecture

- **Data layer**: All reads/writes go through Supabase (admin client for server-side, optional browser/server clients for auth).
- **Tables/columns**: Database uses **snake_case** (e.g. `deal_stage_history`, `borrower_id`). The app keeps **camelCase** in API and UI via `src/lib/db/map.ts` (`rowToApp`, `rowsToApp`, `appToRow`).
- **API helpers**: `handlePrismaError` in `src/lib/api.ts` renamed to `handleDbError` (and kept as alias for compatibility); handles Supabase/Postgres-style errors.

### New/updated files

- **Supabase**
  - `supabase/schema.sql` – Full Postgres schema (tables, indexes, RLS policies).
  - `supabase/README.md` – How to create a project and run the schema.
- **Lib**
  - `src/lib/supabase/client.ts` – Browser Supabase client.
  - `src/lib/supabase/server.ts` – Server Supabase client (cookies).
  - `src/lib/supabase/admin.ts` – Service-role client for server-only use.
  - `src/lib/supabase/queries.ts` – Shared helpers (e.g. `selectDealsWithRelations`, `selectDealById`, `selectDealDetailById`, `selectBorrowerById`, `insertDeal`, `updateDeal`, `insertDealStageHistory`).
  - `src/lib/db.ts` – Re-exports admin client and mapping helpers (replaces Prisma singleton).
  - `src/lib/db/map.ts` – snake_case ↔ camelCase mapping.
- **App**
  - All API routes under `src/app/api/*` now use `getAdminClient()` (and optionally queries) + mapping.
  - All server components/pages that previously used Prisma now use Supabase (queries or admin client) + mapping.
- **Config**
  - `package.json` – Prisma removed; scripts: `build`, `lint`, `typecheck` (no Prisma steps).
  - `next.config.mjs` – No `ignoreBuildErrors` / `ignoreDuringBuilds`.
  - `.env.example` – Supabase-only vars documented.
  - `.github/workflows/web.yml` – Lint + typecheck + build (no Prisma generate).

### Transactions

- Prisma’s `$transaction` is not used. Multi-step flows (e.g. deal funding, investments) are implemented with sequential Supabase calls. For stronger consistency you could add Postgres functions or RPCs later.

---

## Tables migrated (Supabase schema)

| Table | Purpose |
|-------|--------|
| `user` | App users; optional link to Supabase Auth |
| `borrower` | Borrowers (clients) |
| `lender` | Lenders and criteria |
| `deal` | Deals (borrower, optional lender, stage, loan details) |
| `property` | Properties per deal |
| `capital_pool` | Capital pools per lender |
| `investment` | Investor investments in pools |
| `loan` | Funded loans |
| `loan_payment`, `loan_fee` | Loan payments and fees |
| `scenario` | Scenarios per borrower/deal |
| `match_run`, `lender_match_snapshot` | Matching runs and snapshots |
| `doc_request`, `document_file` | Document requests and files |
| `deal_condition` | Conditions per deal |
| `task` | Tasks (assignable to user/deal) |
| `note` | Polymorphic notes |
| `deal_stage_history` | Stage change history |
| `deal_activity` | Audit log |
| `notification` | User notifications |
| `calendar_event` | Calendar events |
| `brokerage_settings` | Singleton settings |

Relations and indexes follow the original Prisma design; RLS is enabled with per-table policies (e.g. allow all for service role; can be tightened later).

---

## Assumptions

1. **Auth**: App continues to use a demo/single-user style where relevant (e.g. `userId: 'demo'`). Supabase Auth can be wired later and `user.id` aligned with `auth.uid()`.
2. **IDs**: New rows use `gen_random_uuid()::text` or default `cuid`-style IDs where applicable; existing API contract (string IDs) preserved.
3. **Portal routes**: Lender/borrower portals still use “first active” lender/borrower for demo; can be replaced with session-based auth and real tenant selection.
4. **File uploads**: Doc uploads still write to `public/uploads`; Supabase Storage can be adopted later for production.

---

## Manual follow-up

1. **Supabase**
   - Create a project and run `supabase/schema.sql` in the SQL Editor.
   - Optionally run a seed script if you add `supabase/seed.sql`.
2. **Env**
   - Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` in Vercel (and locally in `.env.local`).
3. **Git**
   - Commit and push to `main`; ensure CI (lint, typecheck, build) passes.
4. **Secrets**
   - Ensure no real keys are committed; use `.env.example` and Vercel env only for production keys.

---

## Post-migration fixes (final pass)

- **Dashboard** – `src/app/page.tsx` fully migrated to Supabase: fetches deals, borrowers, tasks, doc requests, and activity via `getAdminClient()` and `rowsToApp`; builds typed NBA snapshots with `toDate()` and passes them to `getNextBestActions`; `PipelineCommandCenter` receives typed `deals`.
- **Client/server** – `MainLayout` marked with `'use client'` so `useSidebar()` is not called during static prerender (fixes `/_not-found` build error).
- **Supabase client** – Admin client returns an untyped `SupabaseClient` so `.insert()`/`.update()` accept payloads without inferring `never`; `TableInsert`/`TableUpdate` casts used in API routes where needed.
- **Domain types** – `BorrowerData`, `DealData`, `LenderData`, `MatchResultItem` exported from `@/lib/domain` (from `./match/types`) for `matchEngine` and API.
- **GdsTdsCalculator** – `calculateGDS`/`calculateTDS` called with a single `GdsTdsInput` object per `MortgageMath` API.
- **ESLint** – `.eslintrc.json` added (extends `next/core-web-vitals`); lint script set to `next lint`; fixed unescaped entities in JSX and removed invalid rule comment in `ThemeProvider`.

---

## Validation

After migration, run:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm build
```

All four should succeed. Fix any remaining TypeScript or ESLint errors without re-enabling `ignoreBuildErrors` or `ignoreDuringBuilds`.
