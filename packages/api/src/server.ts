import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { clientsRouter } from "./routes/clients";
import { dealsRouter } from "./routes/deals";
import { lendersRouter } from "./routes/lenders";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/clients", clientsRouter);
app.use("/deals", dealsRouter);
app.use("/lenders", lendersRouter);

// placeholder for later: /documents/upload (use S3/Supabase Storage)
app.post("/documents/upload", (_req, res) => {
  res.status(501).json({ error: "Not implemented yet. Use S3/Supabase Storage." });
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log([api] listening on http://localhost:);
});