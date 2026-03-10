/**
 * Deal stall risk: incomplete conditions, missing docs, no recent activity.
 */

import type { DealSnapshot, TaskSnapshot, DocRequestSnapshot, ConditionSnapshot } from './types.js';
import type { DealStallRiskResult } from './types.js';

const STALE_DEAL_DAYS = 14;
const HIGH_RISK_DAYS = 7;

export function dealStallRisk(
  deal: DealSnapshot,
  tasks: TaskSnapshot[],
  conditions: ConditionSnapshot[],
  docRequests: DocRequestSnapshot[]
): DealStallRiskResult {
  const reasons: string[] = [];
  const now = new Date();
  const daysSinceUpdate = Math.floor(
    (now.getTime() - new Date(deal.updatedAt).getTime()) / 86400000
  );

  const pendingConditions = conditions.filter((c) => c.status === 'pending');
  const outstandingDocs = docRequests.filter(
    (d) => d.status === 'requested' || d.status === 'rejected'
  );
  const overdueTasks = tasks.filter(
    (t) => t.status === 'pending' && t.dueDate && new Date(t.dueDate) < now
  );

  if (daysSinceUpdate >= STALE_DEAL_DAYS) {
    reasons.push(`No activity for ${daysSinceUpdate} days`);
  }
  if (pendingConditions.length > 0) {
    reasons.push(`${pendingConditions.length} condition(s) pending`);
  }
  if (outstandingDocs.length > 0) {
    reasons.push(`${outstandingDocs.length} document(s) outstanding`);
  }
  if (overdueTasks.length > 0) {
    reasons.push(`${overdueTasks.length} overdue task(s)`);
  }

  let score = 100;
  if (reasons.length >= 3 || daysSinceUpdate >= STALE_DEAL_DAYS) score = 25;
  else if (reasons.length >= 2 || daysSinceUpdate >= HIGH_RISK_DAYS) score = 50;
  else if (reasons.length >= 1) score = 75;

  const label: DealStallRiskResult['label'] =
    score <= 25 ? 'high' : score <= 50 ? 'medium' : 'low';

  return { score, label, reasons };
}

export function documentCompleteness(
  docRequests: DocRequestSnapshot[]
): { requested: number; uploaded: number; verified: number; pctComplete: number } {
  const requested = docRequests.length;
  const uploaded = docRequests.filter(
    (d) => d.status === 'uploaded' || d.status === 'verified'
  ).length;
  const verified = docRequests.filter((d) => d.status === 'verified').length;
  const pctComplete = requested > 0 ? Math.round((verified / requested) * 100) : 100;
  return { requested, uploaded, verified, pctComplete };
}
