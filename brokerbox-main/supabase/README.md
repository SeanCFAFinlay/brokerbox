# Supabase setup for BrokerBox

This app uses **Supabase** as the only backend data layer (no Prisma).

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. Wait for the database to be ready, then open **Project Settings → API**.
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose to client)

## 2. Run the schema

1. In the Supabase dashboard, open **SQL Editor**.
2. Paste and run the contents of **schema.sql** in this folder.
3. This creates all tables, indexes, RLS, and policies.

## 3. Environment variables

Set these in `.env.local` (and in Vercel for production):

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Do not commit real values. Use `.env.example` as a template.

## 4. Optional: seed data

If you have `seed.sql`, run it in the SQL Editor after the schema to load demo data.

## Tables (from Prisma migration)

- **user** – App users; can link to Supabase Auth later via `id`.
- **borrower** – Borrowers (clients).
- **lender** – Lenders and their criteria.
- **deal** – Deals (borrower + optional lender, stage, loan details).
- **property** – Properties linked to deals.
- **capital_pool**, **investment** – Capital and investments.
- **loan**, **loan_payment**, **loan_fee** – Loan tracking.
- **scenario** – Scenarios per borrower/deal.
- **match_run**, **lender_match_snapshot** – Matching results.
- **doc_request**, **document_file** – Document requests and files.
- **deal_condition** – Conditions per deal.
- **task** – Tasks (assignable to users/deals).
- **note** – Polymorphic notes.
- **deal_stage_history** – Stage change audit.
- **deal_activity** – General audit log.
- **notification** – User notifications.
- **calendar_event** – Calendar events.
- **brokerage_settings** – Singleton settings.

All tables use **snake_case** columns. The app maps to camelCase in `src/lib/db.ts`.
