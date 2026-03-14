# BrokerBox buildout roadmap

## Completed phases

### Phase 1 – Build & type clean
- Removed Next.js `ignoreBuildErrors`; TypeScript must pass.
- Prisma generate runs from a temp dir outside repo (script: `scripts/generate-prisma.cjs`); client output in `packages/database/src/generated/client`.
- Set `eslint.ignoreDuringBuilds: true` (see “Remaining” below).
- **packages/utils** no longer depends on **database**; match logic moved to **domain**.

### Phase 2 – Architecture
- **packages/domain** added: match engine, types; no Prisma/UI.
- **apps/web** and **apps/api** use `@brokerbox/domain` for matching.
- **docs/ARCHITECTURE.md** documents package boundaries and build order.

### Phase 3 – Domain services
- **Health**: `leadFreshness`, `dealStallRisk`, `documentCompleteness`.
- **Revenue**: `pipelineVolume`, `fundedVolume`, `estimatedCommission`, `closeRate`, `avgDaysToFund`, `fundedCount`.
- **Next-best-action**: `getNextBestActions(borrowers, deals, tasks, docRequests)`.
- Domain takes plain DTOs only; no Prisma dependency.

### Phase 4 – UX upgrade (broker-first revenue OS)
- **Dashboard**: Domain KPIs, pending tasks, NBA + doc-request action items.
- **Borrower 360**: Lead freshness pill, docs complete KPI, suggested next steps.
- **Deal workspace**: Stall risk pill, docs KPI, suggested next steps, conditions in stall risk.
- **Lender workspace**: Underwriting box (min credit, max LTV/GDS/TDS, loan range, provinces, property types).
- **Tasks**: Overdue-first ordering, overdue callout, OVERDUE pill and row styling.
- **Reports**: Domain revenue metrics (pipeline, funded, close rate, avg days to fund), KPI row.

### Phase 5 – Final hardening
- **Zod validation** on key API routes: `POST/GET` borrowers, `POST/GET/PUT/DELETE` deals, `POST/GET/PUT/DELETE` tasks. Schemas in `apps/web/src/lib/schemas.ts`.
- **Shared API helpers** (`apps/web/src/lib/api.ts`): `parseBody(schema, body)`, `jsonError()`, `handlePrismaError()` for 400/404/409/500 and consistent JSON error shape.
- **Loading states**: Root `loading.tsx`; segment loading for deals, borrowers, tasks, reports, lenders (skeleton-style).
- **Error boundary**: Root `error.tsx` with message and “Try again” reset.
- **Documentation**: This ROADMAP and ARCHITECTURE; next.config documents ESLint TODO.

---

## Remaining (backlog)

- **ESLint during build**: Set `eslint.ignoreDuringBuilds: false` in `apps/web/next.config.ts` and fix remaining rules (e.g. `no-explicit-any`, React hooks) so build runs lint.
- **Zod on more routes**: Apply `parseBody` + schemas to notes, conditions, docvault/upload, lenders, scenarios as needed.
- **Empty states**: Dedicated empty-state components for empty lists (deals, borrowers, tasks) where only tables exist today.
- **API auth**: Protect API routes (e.g. session or API key) and document in ARCHITECTURE.
- **apps/api**: Optional Fastify app; align with domain and database for any new endpoints.
