/**
 * Shared Supabase query helpers. Tables/columns are snake_case; use rowToApp/rowsToApp for responses.
 */

import { getAdminClient } from './admin';
import { rowToApp, rowsToApp, appToRow } from '@/lib/db';
import type { TableInsert, TableUpdate } from '@/types/supabase';

const supabase = () => getAdminClient();

export async function selectDealsWithRelations() {
  const { data, error } = await supabase()
    .from('deal')
    .select('*, borrower(*), lender(*)')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return rowsToApp(data ?? []);
}

export async function selectDealById(id: string) {
  const { data, error } = await supabase()
    .from('deal')
    .select(
      '*, borrower(*), lender(*), doc_request(*, document_file(*)), deal_stage_history(*), scenario(*)'
    )
    .eq('id', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') throw new Error('Not found');
    throw error;
  }
  const deal = rowToApp(data as Record<string, unknown>) as Record<string, unknown>;
  if (deal.dealStageHistory) {
    deal.stageHistory = deal.dealStageHistory;
    delete deal.dealStageHistory;
  }
  if (deal.docRequest) {
    deal.docRequests = Array.isArray(deal.docRequest) ? deal.docRequest : [deal.docRequest];
    delete deal.docRequest;
  }
  if (deal.scenario) {
    deal.scenarios = Array.isArray(deal.scenario) ? deal.scenario : [deal.scenario];
    delete deal.scenario;
  }
  return deal;
}

export async function selectBorrowerById(id: string) {
  const { data, error } = await supabase()
    .from('borrower')
    .select('*, deal(*, lender(*)), scenario(*), doc_request(*, document_file(*))')
    .eq('id', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') throw new Error('Not found');
    throw error;
  }
  const b = rowToApp(data as Record<string, unknown>) as Record<string, unknown>;
  if (b.deal) {
    b.deals = Array.isArray(b.deal) ? b.deal : [b.deal];
    delete b.deal;
  }
  if (b.docRequest) {
    b.docRequests = Array.isArray(b.docRequest) ? b.docRequest : [b.docRequest];
    delete b.docRequest;
  }
  if (b.scenario) {
    b.scenarios = Array.isArray(b.scenario) ? b.scenario : [b.scenario];
    delete b.scenario;
  }
  return b;
}

export async function insertDeal(data: Record<string, unknown>) {
  const row = appToRow<Record<string, unknown>>(data);
  const { data: inserted, error } = await supabase().from('deal').insert(row as TableInsert<'deal'>).select().single();
  if (error) throw error;
  return rowToApp(inserted as Record<string, unknown>);
}

export async function updateDeal(id: string, data: Record<string, unknown>) {
  const row = appToRow<Record<string, unknown>>(data);
  const { data: updated, error } = await supabase().from('deal').update(row as TableUpdate<'deal'>).eq('id', id).select().single();
  if (error) throw error;
  return rowToApp(updated as Record<string, unknown>);
}

export async function insertDealStageHistory(data: Record<string, unknown>) {
  const row = appToRow<Record<string, unknown>>(data);
  const { error } = await supabase().from('deal_stage_history').insert(row as TableInsert<'deal_stage_history'>);
  if (error) throw error;
}

/** Full deal for detail page: borrower, lender, conditions, docRequests+files, stageHistory, scenarios, tasks, loan+payments+fees */
export async function selectDealDetailById(id: string) {
  const s = supabase();
  const { data: dealRow, error } = await s
    .from('deal')
    .select(
      '*, borrower(*), lender(*), deal_condition(*), doc_request(*, document_file(*)), deal_stage_history(*), scenario(*), task(*), loan(*, loan_payment(*), loan_fee(*))'
    )
    .eq('id', id)
    .single();
  if (error || !dealRow) {
    if (error?.code === 'PGRST116') throw new Error('Not found');
    throw error ?? new Error('Not found');
  }
  const deal = rowToApp(dealRow as Record<string, unknown>) as Record<string, unknown>;
  if (deal.dealStageHistory) {
    deal.stageHistory = deal.dealStageHistory;
    delete deal.dealStageHistory;
  }
  if (deal.docRequest) {
    deal.docRequests = Array.isArray(deal.docRequest) ? deal.docRequest : [deal.docRequest];
    delete deal.docRequest;
  }
  if (deal.scenario) {
    deal.scenarios = Array.isArray(deal.scenario) ? deal.scenario : [deal.scenario];
    delete deal.scenario;
  }
  if (deal.dealCondition) {
    deal.conditions = Array.isArray(deal.dealCondition) ? deal.dealCondition : [deal.dealCondition];
    delete deal.dealCondition;
  }
  if (deal.task) {
    deal.tasks = Array.isArray(deal.task) ? deal.task : [deal.task];
    delete deal.task;
  }
  if (deal.loan && typeof deal.loan === 'object' && deal.loan !== null) {
    const loan = deal.loan as Record<string, unknown>;
    if (loan.loanPayment) {
      loan.payments = Array.isArray(loan.loanPayment) ? loan.loanPayment : [loan.loanPayment];
      delete loan.loanPayment;
    }
    if (loan.loanFee) {
      loan.fees = Array.isArray(loan.loanFee) ? loan.loanFee : [loan.loanFee];
      delete loan.loanFee;
    }
  }
  return deal;
}
