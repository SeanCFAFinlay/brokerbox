import { Router } from "express";
import { prisma } from "@brokerbox/db/src/index";

export const clientsRouter = Router();

clientsRouter.get("/", async (_req, res) => {
  const items = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });
  res.json(items);
});

clientsRouter.post("/", async (req, res) => {
  const { name, email, phone } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "name required" });

  const created = await prisma.client.create({ data: { name, email, phone } });
  res.json(created);
});