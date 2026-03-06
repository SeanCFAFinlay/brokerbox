import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@brokerbox/db/src/index";

export const authRouter = Router();

function signToken(payload: { userId: string; role: string }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

authRouter.post("/register", async (req, res) => {
  const { email, password, role } = req.body ?? {};
  if (!email || !password || !role) return res.status(400).json({ error: "email, password, role required" });

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hash, role }
  });

  const token = signToken({ userId: user.id, role: user.role });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "email and password required" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ userId: user.id, role: user.role });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});