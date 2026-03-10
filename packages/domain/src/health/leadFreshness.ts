/**
 * Lead freshness: days since last activity, score, label.
 */

import type { BorrowerSnapshot } from './types.js';
import type { LeadFreshnessResult } from './types.js';

const STALE_DAYS = 30;
const COOL_DAYS = 14;
const WARM_DAYS = 7;

export function leadFreshness(
  borrower: BorrowerSnapshot,
  lastActivityAt?: Date | null
): LeadFreshnessResult {
  const ref = lastActivityAt ?? borrower.updatedAt;
  const now = new Date();
  const daysSinceActivity = Math.floor(
    (now.getTime() - new Date(ref).getTime()) / 86400000
  );

  let label: LeadFreshnessResult['label'] = 'stale';
  let score = 0;
  if (daysSinceActivity <= 3) {
    label = 'hot';
    score = 100;
  } else if (daysSinceActivity <= WARM_DAYS) {
    label = 'warm';
    score = 75;
  } else if (daysSinceActivity <= COOL_DAYS) {
    label = 'cool';
    score = 50;
  } else if (daysSinceActivity <= STALE_DAYS) {
    label = 'cool';
    score = 25;
  }

  return { score, label, daysSinceActivity };
}
