/**
 * Next-best-action engine: rule-based suggestions for broker follow-up.
 */

import type {
  NextBestAction,
  NBABorrowerSnapshot,
  NBADealSnapshot,
  NBATaskSnapshot,
  NBADocSnapshot,
} from './types.js';

const STALE_DAYS = 14;
const DOC_OVERDUE_DAYS = 7;

export function getNextBestActions(
  borrowers: NBABorrowerSnapshot[],
  deals: NBADealSnapshot[],
  tasks: NBATaskSnapshot[],
  docRequests: NBADocSnapshot[]
): NextBestAction[] {
  const actions: NextBestAction[] = [];
  const now = new Date();

  for (const task of tasks) {
    if (task.status !== 'pending') continue;
    if (task.dueDate && new Date(task.dueDate) < now) {
      actions.push({
        type: 'chase_conditions',
        title: 'Overdue task',
        reason: `Task due ${new Date(task.dueDate).toLocaleDateString()}`,
        priority: 1,
        entityType: task.dealId ? 'deal' : (task.entityType?.toLowerCase() === 'lender' ? 'lender' : task.entityType?.toLowerCase() === 'deal' ? 'deal' : 'borrower'),
        entityId: task.dealId ?? task.entityId ?? '',
        href: task.dealId ? `/deals/${task.dealId}` : undefined,
      });
    }
  }

  for (const doc of docRequests) {
    if (doc.status !== 'requested') continue;
    const daysOut = Math.floor(
      (now.getTime() - new Date(doc.createdAt).getTime()) / 86400000
    );
    if (daysOut >= DOC_OVERDUE_DAYS) {
      actions.push({
        type: 'request_docs',
        title: 'Document outstanding',
        reason: `Requested ${daysOut} days ago`,
        priority: 2,
        entityType: 'borrower',
        entityId: doc.borrowerId,
        href: `/borrowers/${doc.borrowerId}`,
      });
    }
  }

  for (const deal of deals) {
    if (['funded', 'declined', 'archived'].includes(deal.stage)) continue;
    const daysSince = Math.floor(
      (now.getTime() - new Date(deal.updatedAt).getTime()) / 86400000
    );
    if (daysSince >= STALE_DAYS) {
      actions.push({
        type: 'reengage_stale',
        title: 'Stale deal',
        reason: `No activity for ${daysSince} days`,
        priority: 2,
        entityType: 'deal',
        entityId: deal.id,
        href: `/deals/${deal.id}`,
      });
    }
    if (deal.stage === 'intake' || deal.stage === 'in_review') {
      actions.push({
        type: 'run_match',
        title: 'Run lender match',
        reason: 'Deal ready for matching',
        priority: 3,
        entityType: 'deal',
        entityId: deal.id,
        href: `/deals/${deal.id}`,
      });
    }
  }

  for (const b of borrowers) {
    const daysSince = Math.floor(
      (now.getTime() - new Date(b.updatedAt).getTime()) / 86400000
    );
    if (daysSince >= STALE_DAYS) {
      const hasActiveDeal = deals.some(
        (d) => d.borrowerId === b.id && !['funded', 'declined', 'archived'].includes(d.stage)
      );
      if (hasActiveDeal) {
        actions.push({
          type: 'call_borrower',
          title: 'Follow up with borrower',
          reason: `No contact for ${daysSince} days`,
          priority: 2,
          entityType: 'borrower',
          entityId: b.id,
          href: `/borrowers/${b.id}`,
        });
      }
    }
  }

  actions.sort((a, b) => a.priority - b.priority);
  return actions.slice(0, 10);
}
