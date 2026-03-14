/**
 * Zod schemas for API request bodies. Keep minimal (required fields + common optionals).
 */

import { z } from 'zod';

const optionalString = z.string().optional();
const optionalNumber = z.number().optional().nullable();
const optionalDate = z.union([z.string(), z.date()]).optional().nullable();

export const createBorrowerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required'),
  phone: optionalString,
  address: optionalString,
  city: optionalString,
  province: z.string().optional(),
  postalCode: optionalString,
  income: z.number().optional(),
  verifiedIncome: optionalNumber,
  employmentStatus: z.string().optional(),
  borrowerType: z.string().optional(),
  liabilities: z.number().optional(),
  creditScore: z.number().int().optional(),
  creditScoreDate: optionalDate,
  dateOfBirth: optionalDate,
  coBorrowerName: optionalString,
  coBorrowerEmail: optionalString,
  notes: optionalString,
  status: z.string().optional(),
});

export const createDealSchema = z.object({
  borrowerId: z.string().min(1, 'Borrower is required'),
  lenderId: optionalString.nullable(),
  stage: z.string().optional(),
  priority: z.string().optional(),
  propertyAddress: optionalString,
  propertyType: z.string().optional(),
  propertyValue: z.number().optional(),
  loanAmount: z.number().optional(),
  interestRate: optionalNumber,
  termMonths: z.number().int().optional(),
  amortMonths: z.number().int().optional(),
  position: z.string().optional(),
  loanPurpose: z.string().optional(),
  occupancyType: z.string().optional(),
  exitStrategy: optionalString,
  brokerFee: optionalNumber,
  lenderFee: optionalNumber,
  totalRevenue: optionalNumber,
  agentCommissionSplit: z.number().optional(),
  netBrokerageRevenue: optionalNumber,
  closingDate: optionalDate,
  fundingDate: optionalDate,
  notes: optionalString,
});

export const updateDealSchema = createDealSchema.partial().extend({
  changedBy: z.string().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: optionalString,
  dueDate: optionalDate,
  status: z.enum(['pending', 'completed']).optional(),
  priority: z.string().optional(),
  assignedToId: optionalString.nullable(),
  entityType: optionalString.nullable(),
  entityId: optionalString.nullable(),
  dealId: optionalString.nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: optionalString,
  dueDate: optionalDate,
  status: z.enum(['pending', 'completed']).optional(),
  priority: z.string().optional(),
  assignedToId: optionalString.nullable(),
  entityType: optionalString.nullable(),
  entityId: optionalString.nullable(),
});
