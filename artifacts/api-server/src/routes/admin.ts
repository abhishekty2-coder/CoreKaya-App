import { Router } from "express";
import { db } from "@workspace/db";
import { workoutsTable, productsTable, quotesTable } from "@workspace/db/schema";
import { eq, count } from "drizzle-orm";

const router = Router();

router.get("/admin/stats", async (req, res) => {
  try {
    const [workouts] = await db.select({ count: count() }).from(workoutsTable);
    const [products] = await db.select({ count: count() }).from(productsTable);
    const [quotes] = await db.select({ count: count() }).from(quotesTable);

    const allWorkouts = await db.select({ isPublished: workoutsTable.isPublished }).from(workoutsTable);
    const allProducts = await db.select({ isPublished: productsTable.isPublished }).from(productsTable);
    const allQuotes = await db.select({ status: quotesTable.status }).from(quotesTable);

    res.json({
      totalWorkouts: workouts.count,
      totalProducts: products.count,
      totalQuotes: quotes.count,
      pendingQuotes: allQuotes.filter((q) => q.status === "pending").length,
      publishedWorkouts: allWorkouts.filter((w) => w.isPublished).length,
      publishedProducts: allProducts.filter((p) => p.isPublished).length,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get admin stats" });
  }
});

export default router;
