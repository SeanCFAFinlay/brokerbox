# BrokerBox – GitHub & Vercel deployment (brokerbox.ca)

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
- **vercel.json**: Build command set to `pnpm run build --filter=@brokerbox/web` so Turbo builds `@brokerbox/database` and `@brokerbox/domain` before `@brokerbox/web`; then copy `.next` from `apps/web` to repo root for Vercel.
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
| **Build Command** | From `apps/web/vercel.json`: `cd ../.. && pnpm run build --filter=@brokerbox/web` |
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
