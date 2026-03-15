/**
 * Input shapes for health/engagement scoring. Callers pass data from Supabase or API.
 */

export interface BorrowerSnapshot {
  id: string;
  updatedAt: Date;
  status?: string;
  creditScore?: number;
}

export interface DealSnapshot {
  id: string;
  stage: string;
  updatedAt: Date;
  createdAt: Date;
  fundingDate?: Date | null;
  closingDate?: Date | null;
  priority?: string;
}

export interface TaskSnapshot {
  id: string;
  dueDate: Date | null;
  status: string;
  dealId: string | null;
}

export interface DocRequestSnapshot {
  id: string;
  status: string;
  createdAt: Date;
  expiresAt: Date | null;
}

export interface ConditionSnapshot {
  id: string;
  status: string;
}

export interface LeadFreshnessResult {
  score: number;
  label: 'hot' | 'warm' | 'cool' | 'stale';
  daysSinceActivity: number;
}

export interface DealStallRiskResult {
  score: number;
  label: 'low' | 'medium' | 'high';
  reasons: string[];
}

export interface DocCompletenessResult {
  requested: number;
  uploaded: number;
  verified: number;
  pctComplete: number;
}
