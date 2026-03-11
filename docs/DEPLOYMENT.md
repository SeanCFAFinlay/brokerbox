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
| **Root Directory** | **Leave empty** (repo root). Do not set to apps/web. |
| **Install Command** | `pnpm install --no-frozen-lockfile` (from root `vercel.json`) |
| **Build Command** | From root `vercel.json`: `pnpm run build --filter=@brokerbox/web && mkdir -p .next && cp -r apps/web/.next/. .next/` |
| **Node.js Version** | 20 (use `.node-version` in repo or Project Settings → General) |
| **Production branch** | `main` |

- Build runs from repo root: Turbo builds `@brokerbox/database`, `@brokerbox/domain`, then `@brokerbox/web`; output is copied to `.next` at root so Vercel serves the app.
- **DATABASE_URL**: Not required for build (Prisma generate uses a placeholder if unset). **Required for Production** (runtime) — set your PostgreSQL URL in Environment Variables for Production (and Preview if you need DB there).
- Optional: **AZURE_CLIENT_ID**, **AZURE_CLIENT_SECRET**, **AZURE_REDIRECT_URI** for Outlook auth.

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
2. **Production branch**: **main** (Settings → Git).
3. **Root Directory**: **Leave empty** (repo root). Do not set to apps/web.
4. **Node**: Set Node.js version to **20** (Project Settings → General; repo has `.node-version`).
5. **Domain**: Add **brokerbox.ca** (Settings → Domains) → Production. Point DNS to Vercel (e.g. CNAME to `cname.vercel-dns.com`).
6. **Env**: Add **DATABASE_URL** for **Production** (and Preview if needed). PostgreSQL URL. Build works without it (placeholder used for Prisma generate); runtime needs the real URL.
7. **Deploy**: Push to **main** or redeploy. Build uses root `vercel.json`; after success, brokerbox.ca serves the app.

**Target mapping**

- GitHub repo: **SeanCFAFinlay/brokerbox**
- Vercel project: **brokerbox** (or the one linked to that repo)
- Production branch: **main**
- Production domain: **brokerbox.ca**
