# BrokerBox

Mortgage broker CRM monorepo: Next.js web app, domain logic, Prisma database.

## Quick start

```bash
pnpm install
pnpm run dev          # web app at http://localhost:3000
pnpm run build        # full monorepo build
pnpm run build --filter=@brokerbox/web   # same as Vercel (web + deps only)
```

## Scripts (from repo root)

| Command | Purpose |
|--------|--------|
| `pnpm run dev` | Start web app (Turbo runs dev in apps/web) |
| `pnpm run build` | Build all packages |
| `pnpm run build --filter=@brokerbox/web` | Build for deploy (what Vercel runs) |
| `pnpm run lint` | Lint all packages |
| `pnpm run typecheck` | Type-check all packages |
| `pnpm run db:generate` | Generate Prisma client |
| `pnpm run db:push` | Push schema to DB |
| `pnpm run db:seed` | Seed database (from apps/web) |

## Docs

- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** – Vercel settings, build, brokerbox.ca
- **[docs/VERCEL-OWNERSHIP-AND-CLEANUP.md](docs/VERCEL-OWNERSHIP-AND-CLEANUP.md)** – STM TECH team, domain, Git mapping, 404

## Structure

- `apps/web` – Next.js app (production app for brokerbox.ca)
- `packages/database` – Prisma schema + generated client
- `packages/domain` – Match, NBA, revenue, workflow logic

## Env

Copy `.env.example` and set `DATABASE_URL` (required for web app). Optional: `AZURE_*` for Outlook.
