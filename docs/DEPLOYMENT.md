# BrokerBox – GitHub & Vercel deployment (brokerbox.ca)

For **Vercel team ownership** (STM TECH only, no personal/Hobby scope), **cleanup steps**, and **404-at-/ troubleshooting**, see **[VERCEL-OWNERSHIP-AND-CLEANUP.md](./VERCEL-OWNERSHIP-AND-CLEANUP.md)**.

## A. Repo audit result

| Item | Value |
|------|--------|
| **Repo path** | `c:\Users\sean\BBBUILDOUT\brokerbox` (git root) |
| **Branch** | `main` |
| **Origin** | `https://github.com/SeanCFAFinlay/brokerbox.git` (fetch + push) |
| **Local changes** | All committed and pushed (Phase 4–5 UX, Zod, loading/error, docs, CI fix). |
| **Push status** | `main` pushed to `origin/main`; local and remote in sync. |

---

## B. Build/CI fixes applied

- **Git**: Staged and committed all previously uncommitted work (loading.tsx, error.tsx, api/schemas, docs, domain index/match/nba/revenue, vercel.json, .gitignore, PWA file churn, utils match removal). Ignored `packages/database/src/generated/` and `local_build_error.log` via `.gitignore`.
- **vercel.json**: With Root Directory = `apps/web`, build uses `apps/web/vercel.json`. Build command explicitly builds workspace dependencies (`@brokerbox/domain`, `@brokerbox/database`) then `@brokerbox/web` directly — bypassing `turbo run build` to avoid Vercel's Turbo Remote Cache intercepting the build and returning a 138ms cache-hit with no output files. Output stays in `apps/web/.next` (no copy).
- **CI (`.github/workflows/web.yml`)**: Replaced `pnpm --dir apps/web build` with `pnpm run build --filter=@brokerbox/web` so the same dependency order runs in GitHub Actions. Aligned pnpm version with repo (9).
- **Still required outside repo**: In Vercel dashboard, set env vars (e.g. `DATABASE_URL`) if the app uses DB at build or runtime. No code suppressions or fake fixes were added.

---

## C. Correct Vercel production settings

Use these in the Vercel project linked to **SeanCFAFinlay/brokerbox**:

| Setting | Value |
|--------|--------|
| **Framework Preset** | Next.js |
| **Root Directory** | **`apps/web`** (required — so .next stays in app dir and paths resolve) |
| **Install Command** | `pnpm install --no-frozen-lockfile` (Vercel runs from repo root) |
| **Build Command** | From `apps/web/vercel.json`: `cd ../.. && pnpm --filter @brokerbox/domain run build && pnpm --filter @brokerbox/database run build && pnpm --filter @brokerbox/web run build` |
| **Node.js Version** | 20 (`.node-version` in repo or Project Settings) |
| **Production branch** | `main` |

- With **Root Directory** = `apps/web`, install runs from repo root, then build runs from `apps/web` (runs monorepo build from repo root). Output is `apps/web/.next`; no copy, so module paths stay valid.
- **DATABASE_URL**: Not required for build. **Required for Production** (runtime).
- Optional: **AZURE_*** for Outlook auth.

---

## D. Final Git commands (PowerShell)

Already run; use these to re-sync in future:

```powershell
cd c:\Users\sean\BBBUILDOUT\brokerbox

git rev-parse --show-toplevel
git remote -v
git branch --show-current
git status

git add -A
git status
git commit -m "your message"
git fetch origin
git pull origin main --rebase
git push origin main
```

**If you must recover from a bad remote state (use with care):**

```powershell
git fetch origin
git push origin main --force-with-lease
```

---

## E. Vercel checklist for brokerbox.ca

1. **Project**: Connected to GitHub repo **SeanCFAFinlay/brokerbox**.
2. **Production branch**: **main**.
3. **Root Directory**: **`apps/web`** (Settings → General). Required so build output and paths are correct.
4. **Node**: **20**.
5. **Domain**: **brokerbox.ca** → Production; DNS CNAME to Vercel.
6. **Env**: **DATABASE_URL** for Production (and Preview if needed).
7. **Deploy**: Push to **main** or redeploy. Build uses `apps/web/vercel.json`; brokerbox.ca serves the app.

**Target mapping**

- GitHub repo: **SeanCFAFinlay/brokerbox**
- Vercel project: **brokerbox** (or the one linked to that repo)
- Production branch: **main**
- Production domain: **brokerbox.ca**

---

## F. If the build fails on Vercel

1. **Confirm Root Directory**
   - **Settings → General → Root Directory** must be **`apps/web`**.
   - If it’s empty, Vercel uses the repo root and looks for `.next` in the wrong place. Set it to **`apps/web`** and redeploy.

2. **Don’t override Build Command in the dashboard**
   - With Root Directory = `apps/web`, the build command is read from **`apps/web/vercel.json`**:  
     `cd ../.. && pnpm --filter @brokerbox/domain run build && pnpm --filter @brokerbox/database run build && pnpm --filter @brokerbox/web run build`
   - In **Settings → Build & Development**, leave **Build Command** empty (so Vercel uses the app’s `vercel.json`). If you set a custom build command, it must be exactly that.

3. **Install Command**
   - Vercel runs the Install Command from the **repository root** (parent of `apps/web`). Use:
   - **Install Command**: `pnpm install --no-frozen-lockfile`
   - Leave **Output Directory** empty so Next.js uses `apps/web/.next` automatically.

4. **Prisma / “engine not found”**
   - The app uses `outputFileTracingRoot` and `outputFileTracingIncludes` so the Prisma client and engine binary are included in the serverless bundle. If you still see engine errors, ensure **Root Directory** is `apps/web` and redeploy.

5. **Node version**
   - Set **Node.js Version** to **20** (Project Settings or `.node-version` at repo root).

6. **Domain (brokerbox.ca)**
   - **Settings → Domains**: add **brokerbox.ca**, assign to **Production**.
   - In your DNS provider: CNAME **brokerbox.ca** (or **www**) to **cname.vercel-dns.com** (or the value Vercel shows).
   - After DNS propagates, Vercel will serve the app at brokerbox.ca.

7. **Build completes in < 1 second with no output ("Detected Turbo. Adjusting default settings")**
   - Vercel detected `turbo.json` and enabled Turbo Remote Cache. When the cache has a hit for the current commit, `turbo run build` replays the cached output without writing files to disk, so `apps/web/.next` is empty and nothing is deployed.
   - **Fix already applied**: `apps/web/vercel.json` now uses explicit per-package `pnpm --filter` commands (not `turbo run build`) so each build step always runs fresh and files are always written locally.
   - If you see this again, ensure no dashboard override is re-introducing a `turbo run build` or root-level `pnpm run build --filter=...` call in place of the explicit per-package `pnpm --filter <pkg> run build` commands.
