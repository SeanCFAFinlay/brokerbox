import { PrismaClient } from './generated/client/index.js';
export * from './generated/client/index.js';
export const prisma = globalThis.__prisma ?? new PrismaClient({ log: ["error", "warn"] });
if (process.env.NODE_ENV !== "production")
    globalThis.__prisma = prisma;
