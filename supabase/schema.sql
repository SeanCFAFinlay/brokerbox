-- BrokerBox Supabase schema (migrated from Prisma)
-- Run this in Supabase SQL Editor to create all tables.
-- Uses snake_case columns; app layer maps to camelCase where needed.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users (app-level; link to auth.users via id if using Supabase Auth) ───
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT 'Demo Broker',
  role TEXT NOT NULL DEFAULT 'broker',
  base_commission_split DOUBLE PRECISION NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lender_id TEXT,
  outlook_access_token TEXT,
  outlook_refresh_token TEXT,
  outlook_token_expiry TIMESTAMPTZ,
  outlook_enabled BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_user_lender ON "user"(lender_id);
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);

-- ─── Borrower ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS borrower (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  city TEXT,
  province TEXT NOT NULL DEFAULT 'ON',
  postal_code TEXT,
  income DOUBLE PRECISION NOT NULL DEFAULT 0,
  verified_income DOUBLE PRECISION,
  employment_status TEXT NOT NULL DEFAULT 'employed',
  borrower_type TEXT NOT NULL DEFAULT 'primary',
  liabilities DOUBLE PRECISION NOT NULL DEFAULT 0,
  credit_score INT NOT NULL DEFAULT 650,
  credit_score_date TIMESTAMPTZ,
  date_of_birth TIMESTAMPTZ,
  co_borrower_name TEXT,
  co_borrower_email TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_borrower_email ON borrower(email);

-- Add user.lender_id FK after lender exists (below)
-- ─── Lender ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lender (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  contact_name TEXT,
  min_credit_score INT NOT NULL DEFAULT 600,
  max_ltv DOUBLE PRECISION NOT NULL DEFAULT 80,
  max_gds DOUBLE PRECISION NOT NULL DEFAULT 39,
  max_tds DOUBLE PRECISION NOT NULL DEFAULT 44,
  supported_provinces TEXT[] NOT NULL DEFAULT ARRAY['ON'],
  property_types TEXT[] NOT NULL DEFAULT ARRAY['residential'],
  position_types TEXT[] NOT NULL DEFAULT ARRAY['1st'],
  product_categories TEXT[] NOT NULL DEFAULT ARRAY['residential'],
  min_loan DOUBLE PRECISION NOT NULL DEFAULT 50000,
  max_loan DOUBLE PRECISION NOT NULL DEFAULT 5000000,
  term_min INT NOT NULL DEFAULT 6,
  term_max INT NOT NULL DEFAULT 360,
  pricing_premium DOUBLE PRECISION NOT NULL DEFAULT 0,
  base_rate DOUBLE PRECISION NOT NULL DEFAULT 5.5,
  lender_fees DOUBLE PRECISION NOT NULL DEFAULT 0,
  speed INT NOT NULL DEFAULT 5,
  exceptions_tolerance INT NOT NULL DEFAULT 3,
  appetite INT NOT NULL DEFAULT 5,
  capital_available DOUBLE PRECISION NOT NULL DEFAULT 0,
  capital_committed DOUBLE PRECISION NOT NULL DEFAULT 0,
  notes TEXT,
  underwriting_notes TEXT,
  document_requirements TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User references lender (deferred to avoid circular dependency)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_lender_id_fkey'
  ) THEN
    ALTER TABLE "user" ADD CONSTRAINT user_lender_id_fkey FOREIGN KEY (lender_id) REFERENCES lender(id);
  END IF;
EXCEPTION WHEN undefined_object THEN
  NULL;
END $$;

-- ─── Capital pool & investment ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS capital_pool (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  total_amount DOUBLE PRECISION NOT NULL,
  available_amount DOUBLE PRECISION NOT NULL,
  effective_ltv DOUBLE PRECISION NOT NULL DEFAULT 75,
  utilization_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
  min_investment DOUBLE PRECISION NOT NULL DEFAULT 50000,
  target_yield DOUBLE PRECISION NOT NULL DEFAULT 8.0,
  status TEXT NOT NULL DEFAULT 'active',
  lender_id TEXT NOT NULL REFERENCES lender(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_capital_pool_lender ON capital_pool(lender_id);

CREATE TABLE IF NOT EXISTS investment (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  amount DOUBLE PRECISION NOT NULL,
  yield DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  pool_id TEXT NOT NULL REFERENCES capital_pool(id),
  user_id TEXT NOT NULL REFERENCES "user"(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_investment_pool ON investment(pool_id);
CREATE INDEX IF NOT EXISTS idx_investment_user ON investment(user_id);

-- ─── Deal ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deal (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  borrower_id TEXT NOT NULL REFERENCES borrower(id) ON DELETE CASCADE,
  lender_id TEXT REFERENCES lender(id),
  stage TEXT NOT NULL DEFAULT 'intake',
  priority TEXT NOT NULL DEFAULT 'normal',
  property_value DOUBLE PRECISION NOT NULL DEFAULT 0,
  property_address TEXT,
  property_type TEXT NOT NULL DEFAULT 'residential',
  loan_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  interest_rate DOUBLE PRECISION,
  term_months INT NOT NULL DEFAULT 300,
  amort_months INT NOT NULL DEFAULT 300,
  position TEXT NOT NULL DEFAULT '1st',
  loan_purpose TEXT NOT NULL DEFAULT 'purchase',
  occupancy_type TEXT NOT NULL DEFAULT 'owner_occupied',
  exit_strategy TEXT,
  property_tax_arrears BOOLEAN NOT NULL DEFAULT false,
  zoning TEXT NOT NULL DEFAULT 'urban',
  has_septic BOOLEAN NOT NULL DEFAULT false,
  is_island_property BOOLEAN NOT NULL DEFAULT false,
  ltv DOUBLE PRECISION,
  gds DOUBLE PRECISION,
  tds DOUBLE PRECISION,
  monthly_payment DOUBLE PRECISION,
  match_score INT,
  broker_fee DOUBLE PRECISION,
  lender_fee DOUBLE PRECISION,
  total_revenue DOUBLE PRECISION,
  agent_commission_split DOUBLE PRECISION NOT NULL DEFAULT 50,
  net_brokerage_revenue DOUBLE PRECISION,
  closing_date TIMESTAMPTZ,
  funding_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deal_borrower ON deal(borrower_id);
CREATE INDEX IF NOT EXISTS idx_deal_lender ON deal(lender_id);
CREATE INDEX IF NOT EXISTS idx_deal_stage ON deal(stage);
CREATE INDEX IF NOT EXISTS idx_deal_updated ON deal(updated_at);

-- ─── Property (deal sub-entity) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS property (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  deal_id TEXT NOT NULL REFERENCES deal(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  city TEXT,
  province TEXT NOT NULL DEFAULT 'ON',
  postal_code TEXT,
  property_type TEXT NOT NULL DEFAULT 'residential',
  estimated_value DOUBLE PRECISION NOT NULL DEFAULT 0,
  annual_taxes DOUBLE PRECISION,
  is_subject BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_property_deal ON property(deal_id);

-- ─── Deal stage history ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deal_stage_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  deal_id TEXT NOT NULL REFERENCES deal(id) ON DELETE CASCADE,
  from_stage TEXT NOT NULL,
  to_stage TEXT NOT NULL,
  changed_by TEXT NOT NULL DEFAULT 'system',
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deal_stage_history_deal ON deal_stage_history(deal_id);

-- ─── Scenario ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scenario (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  borrower_id TEXT NOT NULL REFERENCES borrower(id) ON DELETE CASCADE,
  deal_id TEXT NOT NULL REFERENCES deal(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'purchase',
  status TEXT NOT NULL DEFAULT 'WORKING',
  inputs JSONB NOT NULL DEFAULT '{}',
  results JSONB NOT NULL DEFAULT '{}',
  exit_cost DOUBLE PRECISION,
  is_preferred BOOLEAN NOT NULL DEFAULT false,
  recommendation_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scenario_borrower ON scenario(borrower_id);
CREATE INDEX IF NOT EXISTS idx_scenario_deal ON scenario(deal_id);

-- ─── Match run & snapshots ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS match_run (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  deal_id TEXT NOT NULL REFERENCES deal(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_match_run_deal ON match_run(deal_id);
CREATE INDEX IF NOT EXISTS idx_match_run_timestamp ON match_run(timestamp);

CREATE TABLE IF NOT EXISTS lender_match_snapshot (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  deal_id TEXT NOT NULL REFERENCES deal(id) ON DELETE CASCADE,
  match_run_id TEXT REFERENCES match_run(id) ON DELETE SET NULL,
  lender_id TEXT NOT NULL REFERENCES lender(id),
  score INT NOT NULL,
  passed BOOLEAN NOT NULL,
  failures TEXT[] NOT NULL DEFAULT '{}',
  snapshot JSONB NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lender_match_snapshot_deal ON lender_match_snapshot(deal_id);
CREATE INDEX IF NOT EXISTS idx_lender_match_snapshot_run ON lender_match_snapshot(match_run_id);
CREATE INDEX IF NOT EXISTS idx_lender_match_snapshot_lender ON lender_match_snapshot(lender_id);

-- ─── Calendar event ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calendar_event (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  event_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calendar_event_source ON calendar_event(source_id, source_type);
CREATE INDEX IF NOT EXISTS idx_calendar_event_start ON calendar_event(start_time);

-- ─── Loan & payments & fees ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loan (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  deal_id TEXT NOT NULL UNIQUE REFERENCES deal(id),
  pool_id TEXT REFERENCES capital_pool(id),
  status TEXT NOT NULL DEFAULT 'active',
  funded_date TIMESTAMPTZ NOT NULL,
  maturity_date TIMESTAMPTZ NOT NULL,
  principal_balance DOUBLE PRECISION NOT NULL,
  interest_rate DOUBLE PRECISION NOT NULL,
  interest_type TEXT NOT NULL DEFAULT 'fixed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loan_deal ON loan(deal_id);
CREATE INDEX IF NOT EXISTS idx_loan_pool ON loan(pool_id);
CREATE INDEX IF NOT EXISTS idx_loan_status ON loan(status);

CREATE TABLE IF NOT EXISTS loan_payment (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  loan_id TEXT NOT NULL REFERENCES loan(id),
  amount DOUBLE PRECISION NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL DEFAULT 'regular',
  status TEXT NOT NULL DEFAULT 'cleared',
  principal_portion DOUBLE PRECISION,
  interest_portion DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loan_payment_loan ON loan_payment(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_payment_date ON loan_payment(date);

CREATE TABLE IF NOT EXISTS loan_fee (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  loan_id TEXT NOT NULL REFERENCES loan(id),
  amount DOUBLE PRECISION NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loan_fee_loan ON loan_fee(loan_id);

-- ─── Note (polymorphic) ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS note (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_note_entity ON note(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_note_created ON note(created_at);

-- ─── Doc request & document file ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doc_request (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  borrower_id TEXT NOT NULL REFERENCES borrower(id) ON DELETE CASCADE,
  deal_id TEXT REFERENCES deal(id),
  doc_type TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'requested',
  expires_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_doc_request_deal ON doc_request(deal_id);
CREATE INDEX IF NOT EXISTS idx_doc_request_borrower ON doc_request(borrower_id);
CREATE INDEX IF NOT EXISTS idx_doc_request_created ON doc_request(created_at);

CREATE TABLE IF NOT EXISTS document_file (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  doc_request_id TEXT NOT NULL REFERENCES doc_request(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  path TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  file_size INT NOT NULL DEFAULT 0,
  version INT NOT NULL DEFAULT 1,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_file_request ON document_file(doc_request_id);

-- ─── Deal condition ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deal_condition (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  deal_id TEXT NOT NULL REFERENCES deal(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  cleared_at TIMESTAMPTZ,
  doc_request_id TEXT REFERENCES doc_request(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deal_condition_deal ON deal_condition(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_condition_doc ON deal_condition(doc_request_id);

-- ─── Task ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS task (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'normal',
  assigned_to_id TEXT REFERENCES "user"(id),
  entity_type TEXT,
  entity_id TEXT,
  deal_id TEXT REFERENCES deal(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_deal ON task(deal_id);
CREATE INDEX IF NOT EXISTS idx_task_entity ON task(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_task_assigned ON task(assigned_to_id);

-- ─── Deal activity (audit) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deal_activity (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  actor TEXT NOT NULL DEFAULT 'demo',
  actor_name TEXT NOT NULL DEFAULT 'System',
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  diff JSONB,
  metadata JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deal_activity_entity ON deal_activity(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_deal_activity_timestamp ON deal_activity(timestamp);

-- ─── Notification ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES "user"(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_user_read ON notification(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notification_created ON notification(created_at);

-- ─── Brokerage settings (singleton) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brokerage_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  brokerage_name TEXT NOT NULL DEFAULT 'BrokerBox Financial Group',
  license_number TEXT NOT NULL DEFAULT '',
  principal_broker TEXT NOT NULL DEFAULT '',
  office_address TEXT NOT NULL DEFAULT '',
  office_phone TEXT NOT NULL DEFAULT '',
  office_email TEXT NOT NULL DEFAULT '',
  default_broker_fee DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  default_lender_fee DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  default_term_months INT NOT NULL DEFAULT 12,
  default_amort_months INT NOT NULL DEFAULT 300,
  default_interest_rate DOUBLE PRECISION NOT NULL DEFAULT 5.5
);

-- RLS: enable but allow all for now (app uses service role or anon with policies as needed)
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrower ENABLE ROW LEVEL SECURITY;
ALTER TABLE lender ENABLE ROW LEVEL SECURITY;
ALTER TABLE capital_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal ENABLE ROW LEVEL SECURITY;
ALTER TABLE property ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_run ENABLE ROW LEVEL SECURITY;
ALTER TABLE lender_match_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payment ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_fee ENABLE ROW LEVEL SECURITY;
ALTER TABLE note ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_file ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_condition ENABLE ROW LEVEL SECURITY;
ALTER TABLE task ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokerage_settings ENABLE ROW LEVEL SECURITY;

-- Policy: allow service role full access; anon can be restricted later (policy names unique)
CREATE POLICY "allow_all_user" ON "user" FOR ALL USING (true);
CREATE POLICY "allow_all_borrower" ON borrower FOR ALL USING (true);
CREATE POLICY "allow_all_lender" ON lender FOR ALL USING (true);
CREATE POLICY "allow_all_capital_pool" ON capital_pool FOR ALL USING (true);
CREATE POLICY "allow_all_investment" ON investment FOR ALL USING (true);
CREATE POLICY "allow_all_deal" ON deal FOR ALL USING (true);
CREATE POLICY "allow_all_property" ON property FOR ALL USING (true);
CREATE POLICY "allow_all_deal_stage_history" ON deal_stage_history FOR ALL USING (true);
CREATE POLICY "allow_all_scenario" ON scenario FOR ALL USING (true);
CREATE POLICY "allow_all_match_run" ON match_run FOR ALL USING (true);
CREATE POLICY "allow_all_lender_match_snapshot" ON lender_match_snapshot FOR ALL USING (true);
CREATE POLICY "allow_all_calendar_event" ON calendar_event FOR ALL USING (true);
CREATE POLICY "allow_all_loan" ON loan FOR ALL USING (true);
CREATE POLICY "allow_all_loan_payment" ON loan_payment FOR ALL USING (true);
CREATE POLICY "allow_all_loan_fee" ON loan_fee FOR ALL USING (true);
CREATE POLICY "allow_all_note" ON note FOR ALL USING (true);
CREATE POLICY "allow_all_doc_request" ON doc_request FOR ALL USING (true);
CREATE POLICY "allow_all_document_file" ON document_file FOR ALL USING (true);
CREATE POLICY "allow_all_deal_condition" ON deal_condition FOR ALL USING (true);
CREATE POLICY "allow_all_task" ON task FOR ALL USING (true);
CREATE POLICY "allow_all_deal_activity" ON deal_activity FOR ALL USING (true);
CREATE POLICY "allow_all_notification" ON notification FOR ALL USING (true);
CREATE POLICY "allow_all_brokerage_settings" ON brokerage_settings FOR ALL USING (true);
