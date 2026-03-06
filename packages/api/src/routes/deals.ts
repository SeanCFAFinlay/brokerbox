import { Router } from "express";
import { prisma } from "@brokerbox/db/src/index";

export const dealsRouter = Router();

dealsRouter.get("/", async (_req, res) => {
  const items = await prisma.deal.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true, lender: true, tasks: true, notes: true }
  });
  res.json(items);
});

dealsRouter.post("/", async (req, res) => {
  const { clientId, brokerId, lenderId, amount } = req.body ?? {};
  if (!clientId || !brokerId) return res.status(400).json({ error: "clientId and brokerId required" });

  const created = await prisma.deal.create({
    data: { clientId, brokerId, lenderId: lenderId ?? null, amount: Number(amount ?? 0) }
  });
  res.json(created);
});

dealsRouter.patch("/:id", async (req, res) => {
  const id = req.params.id;
  const { status, lenderId, amount } = req.body ?? {};
  const updated = await prisma.deal.update({
    where: { id },
    data: {
      status: status ?? undefined,
      lenderId: lenderId ?? undefined,
      amount: amount != null ? Number(amount) : undefined
    }
  });
  res.json(updated);
});