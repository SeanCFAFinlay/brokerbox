import { Router } from "express";
import { prisma } from "@brokerbox/db/src/index";

export const lendersRouter = Router();

lendersRouter.get("/", async (_req, res) => {
  const items = await prisma.lender.findMany({ orderBy: { createdAt: "desc" } });
  res.json(items);
});

lendersRouter.post("/", async (req, res) => {
  const { name, criteria } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "name required" });

  const created = await prisma.lender.create({ data: { name, criteria } });
  res.json(created);
});