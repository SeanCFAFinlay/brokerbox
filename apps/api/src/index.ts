import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient, Lender, User } from '@brokerbox/database';
import { runMatch, uploadDocument, MatchResult } from '@brokerbox/utils';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'brokerbox-secret-key-123';

const fastify: FastifyInstance = Fastify({
    logger: true
});

const prisma = new PrismaClient();

// Auth Middleware
async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new Error('No token provided');
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
        request.user = decoded;
    } catch (err) {
        reply.status(401).send({ error: 'Unauthorized' });
    }
}

// Extend FastifyRequest to include user
declare module 'fastify' {
    interface FastifyRequest {
        user?: { userId: string, role: string };
    }
}

// Health check
fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    return { status: 'ok' };
});

// Auth Routes
fastify.post('/auth/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const registerSchema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string(),
        role: z.enum(['admin', 'broker', 'lender_agent', 'borrower']).default('broker'),
    });

    const { email, password, name, role } = registerSchema.parse(request.body);
    const passwordHash = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
                role,
            },
        });

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
    } catch (err) {
        return reply.status(400).send({ error: 'User already exists' });
    }
});

fastify.post('/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const loginSchema = z.object({
        email: z.string().email(),
        password: z.string(),
    });

    const { email, password } = loginSchema.parse(request.body);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
});

// Protected Clients Routes
fastify.get('/clients', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const clients = await prisma.borrower.findMany();
    return clients;
});

// Deals Routes
fastify.post('/deals', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const dealSchema = z.object({
        borrowerId: z.string(),
        propertyValue: z.number().optional(),
        loanAmount: z.number().optional(),
    });

    const data = dealSchema.parse(request.body);
    const deal = await prisma.deal.create({
        data,
    });
    return deal;
});

// Lenders Routes
fastify.get('/lenders', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const lenders = await prisma.lender.findMany();
    return lenders;
});

// Match Engine Route
fastify.post('/match/deal', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const matchSchema = z.object({
        dealId: z.string(),
    });

    const { dealId } = matchSchema.parse(request.body);

    const deal = await prisma.deal.findUnique({
        where: { id: dealId },
        include: { borrower: true },
    });

    if (!deal) {
        return reply.status(404).send({ error: 'Deal not found' });
    }

    const lenders = await prisma.lender.findMany({
        where: { status: 'active' },
    });

    const results = lenders.map((lender: Lender) => runMatch(deal, lender));
    const sorted = results.sort((a: MatchResult, b: MatchResult) => b.score - a.score);

    return sorted;
});

// Document Vault Routes
fastify.post('/documents/upload', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const uploadSchema = z.object({
        dealId: z.string(),
        filename: z.string(),
        type: z.string(),
        content: z.string(),
    });

    const { dealId, filename, type, content } = uploadSchema.parse(request.body);
    const buffer = Buffer.from(content, 'base64');

    const fileUrl = await uploadDocument(buffer, filename, dealId, type);

    const docRequest = await prisma.docRequest.create({
        data: {
            dealId,
            borrowerId: (await prisma.deal.findUnique({ where: { id: dealId } }))?.borrowerId || '',
            docType: type,
            status: 'uploaded',
            files: {
                create: {
                    filename,
                    path: fileUrl,
                    mimeType: 'application/pdf',
                }
            }
        },
        include: { files: true }
    });

    return docRequest;
});

// Run server
const start = async () => {
    try {
        await fastify.listen({ port: 3001, host: '0.0.0.0' });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
