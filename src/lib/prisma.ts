import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    // In development we use a global to prevent multiple instances in hot reload
    // @ts-ignore
    if (!global.__prisma) {
        // @ts-ignore
        global.__prisma = new PrismaClient();
    }
    // @ts-ignore
    prisma = global.__prisma;
}

export default prisma;
