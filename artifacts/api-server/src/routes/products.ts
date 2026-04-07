import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

function mapProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    imageUrl: p.imageUrl,
    affiliateUrl: p.affiliateUrl,
    priceDisplay: p.priceDisplay,
    description: p.description,
    isFeatured: p.isFeatured,
    isPublished: p.isPublished,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/products", async (req, res) => {
  try {
    const { category, featured } = req.query as Record<string, string>;
    let rows = await db.select().from(productsTable);
    if (category) rows = rows.filter((p) => p.category === category);
    if (featured === "true") rows = rows.filter((p) => p.isFeatured);
    res.json(rows.map(mapProduct));
  } catch (err) {
    res.status(500).json({ error: "Failed to list products" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const schema = z.object({
      name: z.string(),
      category: z.string(),
      imageUrl: z.string(),
      affiliateUrl: z.string().optional(),
      priceDisplay: z.string(),
      description: z.string(),
      isFeatured: z.boolean().optional(),
      isPublished: z.boolean().optional(),
    });
    const parsed = schema.parse(req.body);
    const [row] = await db.insert(productsTable).values({
      name: parsed.name,
      category: parsed.category,
      imageUrl: parsed.imageUrl,
      affiliateUrl: parsed.affiliateUrl ?? "https://corekaya.com/",
      priceDisplay: parsed.priceDisplay,
      description: parsed.description,
      isFeatured: parsed.isFeatured ?? false,
      isPublished: parsed.isPublished ?? true,
    }).returning();
    res.status(201).json(mapProduct(row));
  } catch (err) {
    res.status(400).json({ error: "Invalid product data" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [row] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (!row) return res.status(404).json({ error: "Product not found" });
    res.json(mapProduct(row));
  } catch (err) {
    res.status(500).json({ error: "Failed to get product" });
  }
});

router.patch("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const schema = z.object({
      name: z.string().optional(),
      category: z.string().optional(),
      imageUrl: z.string().optional(),
      affiliateUrl: z.string().optional(),
      priceDisplay: z.string().optional(),
      description: z.string().optional(),
      isFeatured: z.boolean().optional(),
      isPublished: z.boolean().optional(),
    });
    const parsed = schema.parse(req.body);
    const [row] = await db.update(productsTable).set(parsed).where(eq(productsTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Product not found" });
    res.json(mapProduct(row));
  } catch (err) {
    res.status(400).json({ error: "Invalid update data" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await db.delete(productsTable).where(eq(productsTable.id, id)).returning();
    if (!deleted.length) return res.status(404).json({ error: "Product not found" });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
