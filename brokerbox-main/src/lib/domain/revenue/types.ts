/**
 * Input shapes for revenue/pipeline metrics. Callers pass deal arrays from Prisma.
 */

export interface DealForRevenue {
  id: string;
  stage: string;
  loanAmount: number;
  createdAt: Date;
  fundingDate?: Date | null;
  totalRevenue?: number | null;
  netBrokerageRevenue?: number | null;
  brokerFee?: number | null;
}
