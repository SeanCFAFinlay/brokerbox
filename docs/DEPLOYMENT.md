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

### Recommended: Root Directory = apps/web (monorepo)

| Setting | Value |
|--------|--------|
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/web` **(required)** |
| **Install Command** | `pnpm install --no-frozen-lockfile` (runs from repo root automatically) |
| **Build Command** | *(from `apps/web/vercel.json`)* `cd ../.. && pnpm run build --filter=@brokerbox/web` |
| **Output Directory** | *(default; .next inside apps/web)* |
| **Node.js Version** | 20.x (Project Settings → General) |
| **Production branch** | `main` |

- With **Root Directory** = `apps/web`, Vercel installs from repo root then builds from `apps/web`; `apps/web/vercel.json` runs the monorepo build so `@brokerbox/database` and `@brokerbox/domain` build before the Next app.
- **Include source files outside Root Directory**: leave enabled (default) so workspace packages are available.

### Alternative: Root Directory empty (repo root)

| Setting | Value |
|--------|--------|
| **Root Directory** | *(leave blank)* |
| **Install Command** | `pnpm install --no-frozen-lockfile` |
| **Build Command** | `pnpm run build --filter=@brokerbox/web && mkdir -p .next && cp -r apps/web/.next/. .next/` |

- Root `vercel.json` defines this. Output `.next` is copied to repo root so Vercel finds it.

### Environment variables (required)

- **DATABASE_URL**: Required for **Build** (Prisma generate) and **Production** (runtime). Use a real PostgreSQL URL for production. For build-only you can use a placeholder (e.g. `postgresql://u:p@localhost:5432/dummy`) if the app does not need DB at build.
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

1. **Project**: Vercel project is connected to GitHub repo **SeanCFAFinlay/brokerbox**.
2. **Production branch**: Set to **main** (Settings → Git).
3. **Root Directory**: Set to **`apps/web`** (Settings → General). This makes the build use `apps/web/vercel.json` and keeps the Next app and its `.next` output in one place.
4. **Install Command**: Override to `pnpm install --no-frozen-lockfile` (Vercel runs it from repo root when Root Directory is set).
5. **Node**: Set Node.js version to **20** (Project Settings → General).
6. **Domain**: Add **brokerbox.ca** (Settings → Domains) and assign it to **Production**. Point DNS for brokerbox.ca to Vercel (e.g. CNAME to `cname.vercel-dns.com`).
7. **Env**: Add **DATABASE_URL** for **Build**, **Preview**, and **Production** (PostgreSQL connection string). Without it, Prisma generate fails at build and the app cannot connect at runtime.
8. **Deploy**: Push to **main** or trigger a redeploy. After the build succeeds, brokerbox.ca will serve the latest deployment.

**Target mapping**

- GitHub repo: **SeanCFAFinlay/brokerbox**
- Vercel project: **brokerbox** (or the one linked to that repo)
- Production branch: **main**
- Production domain: **brokerbox.ca**
