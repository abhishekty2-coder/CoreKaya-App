import { Router } from "express";
import { db } from "@workspace/db";
import { quotesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

function mapQuote(q: typeof quotesTable.$inferSelect) {
  return {
    id: q.id,
    customerName: q.customerName,
    customerEmail: q.customerEmail,
    customerPhone: q.customerPhone,
    productId: q.productId,
    productName: q.productName,
    message: q.message,
    status: q.status,
    createdAt: q.createdAt.toISOString(),
  };
}

router.get("/quotes", async (req, res) => {
  try {
    const rows = await db.select().from(quotesTable).orderBy(quotesTable.createdAt);
    res.json(rows.map(mapQuote));
  } catch (err) {
    res.status(500).json({ error: "Failed to list quotes" });
  }
});

router.post("/quotes", async (req, res) => {
  try {
    const schema = z.object({
      customerName: z.string(),
      customerEmail: z.string(),
      customerPhone: z.string().nullable().optional(),
      productId: z.number().int().nullable().optional(),
      productName: z.string().nullable().optional(),
      message: z.string(),
    });
    const parsed = schema.parse(req.body);
    const [row] = await db.insert(quotesTable).values({
      customerName: parsed.customerName,
      customerEmail: parsed.customerEmail,
      customerPhone: parsed.customerPhone ?? null,
      productId: parsed.productId ?? null,
      productName: parsed.productName ?? null,
      message: parsed.message,
      status: "pending",
    }).returning();
    res.status(201).json(mapQuote(row));
  } catch (err) {
    res.status(400).json({ error: "Invalid quote data" });
  }
});

router.patch("/quotes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = z.object({ status: z.string() }).parse(req.body);
    const [row] = await db.update(quotesTable).set({ status }).where(eq(quotesTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Quote not found" });
    res.json(mapQuote(row));
  } catch (err) {
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
