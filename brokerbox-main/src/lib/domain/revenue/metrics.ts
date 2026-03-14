/**
 * Pipeline and revenue metrics: volume, close rate, days to fund, commissions.
 */

import type { DealForRevenue } from './types';

export function pipelineVolume(deals: DealForRevenue[]): number {
  const active = deals.filter(
    (d) =>
      !['funded', 'declined', 'archived'].includes(d.stage)
  );
  return active.reduce((sum, d) => sum + d.loanAmount, 0);
}

export function fundedVolume(deals: DealForRevenue[]): number {
  return deals
    .filter((d) => d.stage === 'funded')
    .reduce((sum, d) => sum + d.loanAmount, 0);
}

export function estimatedCommission(deals: DealForRevenue[]): number {
  return deals
    .filter((d) => d.stage === 'funded')
    .reduce((sum, d) => sum + (d.netBrokerageRevenue ?? d.totalRevenue ?? d.brokerFee ?? 0), 0);
}

export function closeRate(deals: DealForRevenue[]): number | null {
  const decided = deals.filter((d) =>
    ['funded', 'declined'].includes(d.stage)
  );
  if (decided.length === 0) return null;
  const funded = deals.filter((d) => d.stage === 'funded').length;
  return Math.round((funded / decided.length) * 100);
}

export function avgDaysToFund(deals: DealForRevenue[]): number | null {
  const withDates = deals.filter(
    (d) => d.stage === 'funded' && d.fundingDate && d.createdAt
  );
  if (withDates.length === 0) return null;
  const totalDays = withDates.reduce(
    (sum, d) =>
      sum +
      Math.ceil(
        (new Date(d.fundingDate!).getTime() - new Date(d.createdAt).getTime()) /
          86400000
      ),
    0
  );
  return Math.round(totalDays / withDates.length);
}

export function fundedCount(deals: DealForRevenue[]): number {
  return deals.filter((d) => d.stage === 'funded').length;
}
