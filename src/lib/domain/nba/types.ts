/**
 * Next-best-action: suggested actions for broker with reason and priority.
 */

export type NBAActionType =
  | 'call_borrower'
  | 'request_docs'
  | 'submit_to_lender'
  | 'chase_conditions'
  | 'review_expiring'
  | 'reengage_stale'
  | 'renewal_outreach'
  | 'run_match';

export interface NextBestAction {
  type: NBAActionType;
  title: string;
  reason: string;
  priority: 1 | 2 | 3;
  entityType: 'borrower' | 'deal' | 'lender';
  entityId: string;
  href?: string;
}

export interface NBABorrowerSnapshot {
  id: string;
  updatedAt: Date;
}

export interface NBADealSnapshot {
  id: string;
  borrowerId: string;
  stage: string;
  updatedAt: Date;
}

export interface NBATaskSnapshot {
  id: string;
  dueDate: Date | null;
  status: string;
  dealId: string | null;
  entityType: string | null;
  entityId: string | null;
}

export interface NBADocSnapshot {
  id: string;
  borrowerId: string;
  dealId: string | null;
  status: string;
  createdAt: Date;
}
