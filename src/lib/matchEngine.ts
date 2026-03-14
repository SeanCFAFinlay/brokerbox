/**
 * Re-export from canonical @/lib/domain match engine.
 * Prefer importing from '@/lib/domain' in new code.
 */
export {
  runMatch,
  type BorrowerData,
  type DealData,
  type LenderData,
  type MatchResultItem as MatchResult,
} from '@/lib/domain';
