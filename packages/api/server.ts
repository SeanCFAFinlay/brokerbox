import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@brokerbox/db';
import { evaluateLenderCriteria } from '@brokerbox/core';

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------
// HEALTH 
// ---------------------------------------------------------
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// ---------------------------------------------------------
// DASHBOARD
// ---------------------------------------------------------
app.get('/api/dashboard', async (req, res) => {
    try {
        const activeDeals = await prisma.deal.count({
            where: { stage: { notIn: ['FUNDED', 'LOST', 'CLOSED'] } }
        });

        const activeCapital = await prisma.lenderCapacity.aggregate({
            _sum: { totalCapacity: true }
        });

        const mtdFunded = await prisma.deal.aggregate({
            where: { stage: 'FUNDED' }, // Simplified for mock
            _sum: { loanAmount: true }
        });

        const recentActivity = await prisma.activityFeed.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            kpis: {
                activeDeals,
                capitalAvailable: activeCapital._sum.totalCapacity || 850000000,
                fundedMtd: mtdFunded._sum.loanAmount || 12500000,
                avgDaysToFund: 22,
                closeRate: 68
            },
            activities: recentActivity,
        });
    } catch (e) {
        res.status(500).json({ error: 'Failed to map dashboard payload' });
    }
});

// ---------------------------------------------------------
// DEALS / PIPELINE
// ---------------------------------------------------------
app.get('/api/deals', async (req, res) => {
    try {
        const deals = await prisma.deal.findMany({
            include: {
                parties: { include: { client: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ deals });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/deals/:id', async (req, res) => {
    try {
        const deal = await prisma.deal.findUnique({
            where: { id: req.params.id },
            include: {
                property: true,
                parties: { include: { client: true } },
                documents: true,
                scenarios: {
                    include: { tranches: true }
                }
            }
        });
        if (!deal) return res.status(404).json({ error: 'Not found' });
        res.json({ deal });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ---------------------------------------------------------
// DEAL STAGE UPDATES (WITH FSRA COMPLIANCE GATES)
// ---------------------------------------------------------
app.put('/api/deals/:id/stage', async (req, res) => {
    try {
        const { stage } = req.body;

        const deal = await prisma.deal.findUnique({ where: { id: req.params.id } });
        if (!deal) return res.status(404).json({ error: 'Not found' });

        if (stage === 'FUNDED' || stage === 'COMMITTED') {
            const missingForms = [];
            if (!deal.isForm1Signed) missingForms.push('Form 1 (Investor/Lender Disclosure)');
            if (!deal.isForm10Signed) missingForms.push('Form 10 (Conflict of Interest)');
            if (!deal.isForm215Signed) missingForms.push('Form 2.15 (Borrower Disclosure)');

            if (missingForms.length > 0) {
                return res.status(400).json({
                    error: 'FSRA Compliance Gate Failed',
                    missingForms
                });
            }
        }

        const updatedDeal = await prisma.deal.update({
            where: { id: req.params.id },
            data: { stage }
        });

        // Log history securely 
        await prisma.dealStageHistory.create({
            data: {
                dealId: deal.id,
                oldStage: deal.stage,
                newStage: stage
            }
        });

        // Record to Activity Feed
        await prisma.activityFeed.create({
            data: {
                dealId: deal.id,
                type: 'STAGE_CHANGE',
                title: `Deal moved to ${stage}`
            }
        });

        res.json({ deal: updatedDeal });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ---------------------------------------------------------
// CLIENTS
// ---------------------------------------------------------
app.get('/api/clients', async (req, res) => {
    try {
        const clients = await prisma.client.findMany({
            include: {
                deals: true,
                properties: true
            },
            orderBy: { lastName: 'asc' }
        });
        res.json({ clients });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ---------------------------------------------------------
// LENDERS
// ---------------------------------------------------------
app.get('/api/lenders', async (req, res) => {
    try {
        const lenders = await prisma.lender.findMany({
            include: {
                products: true,
                criteria: {
                    orderBy: { version: 'desc' },
                    take: 1
                }
            },
            orderBy: { name: 'asc' }
        });
        res.json({ lenders });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(port, () => {
    console.log(`[API] BrokerBox API Gateway running on port ${port}`);
});
