import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
  });

// Always cache the client in the global scope to prevent
// exhausting the database connection pool in serverless environments.
globalForPrisma.prisma = prisma;

export const db = prisma;
export default prisma;
