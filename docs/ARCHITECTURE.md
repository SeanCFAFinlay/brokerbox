# BrokerBox Monorepo Architecture

## Target layout (Phase 2+)

- **apps/web** – Next.js App Router; primary broker UI. Depends on `@brokerbox/database`, `@brokerbox/domain`.
- **apps/api** – Optional Fastify API. Depends on `@brokerbox/database`, `@brokerbox/domain`, `@brokerbox/utils`.
- **packages/database** – Prisma schema, generated client, DB access. Single source of truth for persistence.
- **packages/domain** – Business logic only: lender matching, next-best-action (NBA), revenue metrics, health scoring. No UI, no direct DB; callers pass in data. Exports: `runMatch`, `runMatchDealLender`, `leadFreshness`, `dealStallRisk`, `documentCompleteness`, `getNextBestActions`, `pipelineVolume`, `fundedVolume`, `closeRate`, `avgDaysToFund`, etc.
- **packages/utils** – Shared utilities (e.g. storage helpers). No domain logic; no dependency on database.
- **packages/ui** – React Native design system for Expo apps (broker/mobile/client/lender).
- **packages/types** – Shared DTOs if needed; prefer domain and database types where possible.

## Package boundaries

- **domain** does not import from **database** or **utils**; it is pure logic and types.
- **utils** does not import from **database** or **domain**; it is pure helpers.
- **apps/web** and **apps/api** orchestrate: load data via database, call domain for matching/analytics, render or respond.

## Build order

Turbo runs `^build`, so dependency order is automatic: **utils** → **domain** → **database** (and domain has no dep on database), then **api** / **web** (both depend on database and domain).

## Matching

- **Canonical engine**: `@brokerbox/domain` exports `runMatch(borrower, deal, lenders)` (weighted, explainable) and `runMatchDealLender(deal, lender)` (simple, for API).
- **apps/web** and **apps/api** use `@brokerbox/domain`; `apps/web/src/lib/matchEngine.ts` re-exports from domain for backward compatibility.
