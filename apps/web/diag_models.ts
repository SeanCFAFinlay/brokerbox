
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const models = Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_'));
console.log('TOTAL MODELS:', models.length);
console.log('MODELS:', models.sort().join(', '));
prisma.$disconnect();
