import { PrismaClient as RealPrismaClient } from '@prisma/client';

export * from '@prisma/client';

// Explicitly defining models if Prisma generator hides them
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lender {
  id: string;
  name: string;
  contactEmail?: string | null;
  status: string;
}

export interface Deal {
  id: string;
  borrowerId: string;
  lenderId?: string | null;
  stage: string;
  propertyValue: number;
  loanAmount: number;
}

export interface MatchResult {
  lenderId: string;
  score: number;
  passed: boolean;
  failures: string[];
}