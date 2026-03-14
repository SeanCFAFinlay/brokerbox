# BrokerBox – Vercel ownership, cleanup, and 404

**Goal:** BrokerBox deploys **only** from the **STM TECH** Vercel team. **brokerbox.ca** must belong to that team’s canonical project. No personal/Hobby scope. No duplicate projects.

---

## A. Correct Vercel ownership model

| What | Value |
|------|--------|
| **Owner** | **STM TECH** (team) — not your personal/Hobby account |
| **Project name** | **brokerbox** (single canonical project) |
| **Scope in URLs** | `vercel.com/stm-tech/brokerbox` (or your team slug) |
| **Who can deploy** | Only the STM TECH project linked to `SeanCFAFinlay/brokerbox`; no second project under personal or same team deploying the same repo |

**Rule:** One repo → one Vercel project → one team (STM TECH). All production deploys for brokerbox.ca must come from that project.

---

## B. Correct domain ownership model

| What | Value |
|------|--------|
| **Production domain** | **brokerbox.ca** (and optionally **www.brokerbox.ca**) |
| **Assigned to** | The **brokerbox** project under **STM TECH** |
| **Environment** | **Production** (main branch) |
| **DNS** | CNAME (or A) from your registrar to the value Vercel shows for that project (e.g. `cname.vercel-dns.com` or the project’s Vercel hostname) |

**Rule:** brokerbox.ca must point only to the STM TECH **brokerbox** project. No other Vercel project (personal or a duplicate “web” project) should have brokerbox.ca.

---

## C. Correct Git / project mapping

| Item | Value |
|------|--------|
| **GitHub repo** | **SeanCFAFinlay/brokerbox** |
| **Production branch** | **main** |
| **Vercel Git integration** | Only the **STM TECH → brokerbox** project is connected to **SeanCFAFinlay/brokerbox** |
| **Root Directory** | **apps/web** (in that project’s Settings) |
| **Build/Install** | As in `docs/DEPLOYMENT.md` (e.g. Install: `pnpm install --no-frozen-lockfile`, Build from `apps/web/vercel.json`) |

**Rule:** Pushes to **main** trigger a deploy only in the STM TECH **brokerbox** project. No other Vercel project should be connected to this repo for production.

---

## D. Exact cleanup steps (UI)

Do these in order so there is only one canonical live project and brokerbox.ca is correct.

### 1. Confirm / create the canonical project under STM TECH

- Go to [vercel.com](https://vercel.com) and switch to the **STM TECH** team (team switcher top-left).
- Under STM TECH, open (or create) the project named **brokerbox**.
- If you have two projects (e.g. **brokerbox** and **web**) under STM TECH that both use this repo, you will keep **brokerbox** and remove/archive the other in step 4.

### 2. Transfer from personal/Hobby to STM TECH (if brokerbox is under personal)

- Open the **brokerbox** project (from your personal account).
- **Settings** → scroll to **Transfer Project**.
- Click **Transfer** → choose **STM TECH** as the target team.
- Complete the flow (payment method if required; domains/env vars move with the project).
- After transfer, the project lives under **STM TECH** only.

### 3. Attach repo and domain to the STM TECH brokerbox project

- In **STM TECH** → **brokerbox**:
  - **Settings → Git**: Connect to **SeanCFAFinlay/brokerbox**, production branch **main**. Disconnect any other Git connections for this project.
  - **Settings → General → Root Directory**: set **apps/web**.
  - **Settings → Domains**: add **brokerbox.ca**, assign to **Production**. Remove brokerbox.ca from any other project (see step 4).
  - **Settings → Environment Variables**: set **DATABASE_URL** (and any others) for **Production** (and Preview if needed).

### 4. Remove duplicate project and domain from wrong scope

- In **STM TECH**: If there is a second project (e.g. **web**) that was also connected to **SeanCFAFinlay/brokerbox**:
  - Open that project → **Settings → Domains**: remove **brokerbox.ca** if it’s there (so only the canonical **brokerbox** project has it).
  - Then either:
    - **Settings → General** → scroll to **Delete Project** and delete it, or
    - **Settings → Transfer** and transfer it to a “holding” team and leave it unused, or archive it per Vercel’s options.
- In your **personal/Hobby** account: If there is still a **brokerbox** (or similarly named) project:
  - Remove **brokerbox.ca** from its Domains.
  - Delete or archive that project so it doesn’t deploy from main.

### 5. Verify

- **STM TECH → brokerbox**: Git connected to **SeanCFAFinlay/brokerbox**, branch **main**, Root Directory **apps/web**, domain **brokerbox.ca** on Production.
- Trigger a deploy (push to **main** or **Redeploy**). Once the deploy succeeds, open **https://brokerbox.ca** and confirm it serves the BrokerBox app (not 404, not another app).

---

## E. Next code issue: 404 at brokerbox.ca (root `/`)

**Finding:** The repo has no bug that *forces* a 404 on `/`:

- **Middleware** (`apps/web/src/middleware.ts`): Only allows requests through; it does not return 404. The matcher runs for `/` and returns `NextResponse.next()`.
- **Root route**: `apps/web/src/app/page.tsx` exists and is the dashboard (server component using Prisma). It is the correct handler for `/`.
- **No app-level `not-found.tsx`**: 404s are from `notFound()` in a few detail pages (e.g. `/borrowers/[id]`, `/deals/[id]`), not from the root.

**Most likely cause of 404 at `/` on brokerbox.ca:**

1. **Wrong project serving the domain**  
   brokerbox.ca is still assigned to a different Vercel project (e.g. personal or a duplicate “web” project) that either has no deployment or an old/empty app. **Fix:** Complete section D so that only **STM TECH → brokerbox** has brokerbox.ca and only that project deploys from **main**.

2. **Runtime failure on the root page**  
   If the correct project *is* serving brokerbox.ca but the root page throws at runtime (e.g. missing **DATABASE_URL** or Prisma connection failure in production), the serverless function can fail. Depending on platform behavior, that can sometimes surface as a 404 or a generic error. **Fix:** Ensure **DATABASE_URL** (and any required env) is set for **Production** on the **brokerbox** project, and redeploy.

**Optional hardening (if 404 persists after cleanup):**

- Add an explicit **`apps/web/src/app/not-found.tsx`** so that any real 404 (e.g. invalid path) shows a consistent BrokerBox 404 page instead of the default.
- Confirm in Vercel’s **Deployments** and **Functions** logs that requests to `/` hit the correct deployment and whether the root page or Prisma is throwing.

**Summary:** The 404 at `/` is not caused by middleware or a missing route in code. It is most likely due to **brokerbox.ca being served by the wrong Vercel project** or a **runtime error** on the root page (e.g. DB config). Applying section D and ensuring env vars on the STM TECH **brokerbox** project should resolve it; if not, use the optional steps above to narrow it down.
