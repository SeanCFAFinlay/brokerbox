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
| **Root Directory** | *(leave blank – repo root)* |
| **Install Command** | `pnpm install --no-frozen-lockfile` |
| **Build Command** | *(leave blank to use `vercel.json`, or)* `pnpm run build --filter=@brokerbox/web && mkdir -p .next && cp -r apps/web/.next/. .next/` |
| **Output Directory** | *(default; .next at root after build)* |
| **Development Command** | `pnpm run dev` (optional) |
| **Node.js Version** | 20.x (recommended; set in Project Settings → General) |
| **Production branch** | `main` |

- **Root Directory**: Empty so the repo root is used; `vercel.json` at root defines install/build.
- **Env vars**: Add any required variables (e.g. `DATABASE_URL`) in Project Settings → Environment Variables for Production (and Preview if needed).

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
3. **Root Directory**: **Leave empty** (repo root).
4. **Build & Development**: Install Command = `pnpm install --no-frozen-lockfile`; Build Command can be left default (from `vercel.json`) or set as in section C.
5. **Node**: Set Node.js version to **20** (Project Settings → General).
6. **Domain**: In Vercel, add **brokerbox.ca** (Settings → Domains) and assign it to the **Production** deployment. Ensure DNS for brokerbox.ca points to Vercel (e.g. CNAME to `cname.vercel-dns.com` or the A/CNAME values Vercel shows).
7. **Env**: Add `DATABASE_URL` (and any other required vars) for Production (and Preview if the app needs DB there).
8. **Deploy**: Trigger a deploy from the latest **main** (or push a commit). After the build succeeds, Production will serve brokerbox.ca.

**Target mapping**

- GitHub repo: **SeanCFAFinlay/brokerbox**
- Vercel project: **brokerbox** (or the one linked to that repo)
- Production branch: **main**
- Production domain: **brokerbox.ca**
