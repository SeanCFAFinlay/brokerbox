/**
 * Domain types for lender matching. No dependency on Prisma or database.
 */

export interface BorrowerData {
  creditScore: number;
  income: number;
  province: string;
  city: string;
  liabilities: number;
  selfEmployed?: boolean;
}

export interface DealData {
  propertyValue: number;
  loanAmount: number;
  propertyType: string;
  position: string;
  loanPurpose: string;
  termMonths: number;
  ltv: number;
  gds: number;
  tds: number;
}

export interface LenderData {
  id: string;
  name: string;
  minCreditScore: number;
  maxLTV: number;
  maxGDS: number;
  maxTDS: number;
  supportedProvinces: string[];
  propertyTypes: string[];
  positionTypes: string[];
  minLoan: number;
  maxLoan: number;
  termMin: number;
  termMax: number;
  baseRate: number;
  speed: number;
  exceptionsTolerance: number;
  appetite: number;
  pricingPremium: number;
  documentRequirements: string[];
  allowsSelfEmployed: boolean;
  ruralMaxLTV: number;
}

export interface MatchResultItem {
  lenderId: string;
  lenderName: string;
  score: number;
  passed: boolean;
  failures: string[];
  breakdown: { factor: string; score: number; weight: number; weighted: number }[];
  requiredDocs: string[];
  effectiveRate: number;
}

/** Minimal deal + borrower shape for simple per-lender match (e.g. API). */
export interface DealWithBorrowerForMatch {
  borrower?: { creditScore: number } | null;
  ltv?: number | null;
  loanAmount?: number;
  propertyValue?: number;
  propertyType?: string;
}

/** Minimal lender shape for simple per-lender match. */
export interface LenderForMatch {
  id: string;
  minCreditScore: number;
  maxLTV: number;
  minLoan: number;
  maxLoan: number;
  propertyTypes: string[];
}

export interface SimpleMatchResult {
  lenderId: string;
  score: number;
  passed: boolean;
  failures: string[];
}
