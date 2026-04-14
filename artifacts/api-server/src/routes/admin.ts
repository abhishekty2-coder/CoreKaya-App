import { Router } from "express";
import { db } from "@workspace/db";
import {
  workoutsTable,
  productsTable,
  quotesTable,
  badgesTable,
  userBadgesTable,
  userXpTable,
  userStateTable,
  userCompletedWorkoutsTable,
} from "@workspace/db/schema";
import { eq, count, desc, sql } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const LEVEL_NAMES: Record<number, string> = {
  1: "Beginner", 2: "Practitioner", 3: "Devotee", 4: "Expert", 5: "CoreKaya Master",
};

function getLevelFromXp(totalXp: number): number {
  if (totalXp >= 2000) return 5;
  if (totalXp >= 1000) return 4;
  if (totalXp >= 500) return 3;
  if (totalXp >= 200) return 2;
  return 1;
}

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

router.get("/admin/users-progress", async (req, res) => {
  try {
    const states = await db.select().from(userStateTable);
    const xpRows = await db.select().from(userXpTable);
    const badgeRows = await db.select().from(userBadgesTable);
    const completedRows = await db.select().from(userCompletedWorkoutsTable);

    const xpMap = new Map(xpRows.map(r => [r.sessionId, r]));
    const badgeCounts = new Map<string, number>();
    for (const b of badgeRows) {
      badgeCounts.set(b.sessionId, (badgeCounts.get(b.sessionId) || 0) + 1);
    }
    const completedCounts = new Map<string, number>();
    for (const c of completedRows) {
      completedCounts.set(c.sessionId, (completedCounts.get(c.sessionId) || 0) + 1);
    }

    const users = states.map(s => {
      const xp = xpMap.get(s.sessionId);
      const totalXp = xp?.totalXp ?? 0;
      const level = getLevelFromXp(totalXp);
      return {
        sessionId: s.sessionId.slice(-8),
        totalCompleted: completedCounts.get(s.sessionId) || 0,
        currentStreak: s.streak,
        levelName: LEVEL_NAMES[level] || "Beginner",
        badgesEarned: badgeCounts.get(s.sessionId) || 0,
      };
    });

    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: "Failed to get user progress" });
  }
});

router.get("/admin/badges", async (req, res) => {
  try {
    const badges = await db.select().from(badgesTable);
    const badgeCounts = await db
      .select({ badgeId: userBadgesTable.badgeId, count: count() })
      .from(userBadgesTable)
      .groupBy(userBadgesTable.badgeId);

    const countMap = new Map(badgeCounts.map(r => [r.badgeId, r.count]));
    const result = badges.map(b => ({ ...b, earnedCount: countMap.get(b.id) || 0 }));
    res.json({ badges: result });
  } catch (err) {
    res.status(500).json({ error: "Failed to get badges" });
  }
});

router.post("/admin/badges", async (req, res) => {
  try {
    const { slug, name, description, iconEmoji, xpReward, unlockConditionType, unlockConditionValue } = z.object({
      slug: z.string(),
      name: z.string(),
      description: z.string(),
      iconEmoji: z.string(),
      xpReward: z.number().int().default(0),
      unlockConditionType: z.enum(["streak", "workouts_completed", "category_count", "first_workout"]),
      unlockConditionValue: z.number().int(),
    }).parse(req.body);

    const [badge] = await db.insert(badgesTable)
      .values({ slug, name, description, iconEmoji, xpReward, unlockConditionType, unlockConditionValue })
      .returning();
    res.json(badge);
  } catch (err) {
    res.status(400).json({ error: "Failed to create badge" });
  }
});

router.patch("/admin/badges/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const update = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      iconEmoji: z.string().optional(),
      xpReward: z.number().int().optional(),
      unlockConditionType: z.string().optional(),
      unlockConditionValue: z.number().int().optional(),
    }).parse(req.body);
    const [badge] = await db.update(badgesTable).set(update).where(eq(badgesTable.id, id)).returning();
    res.json(badge);
  } catch (err) {
    res.status(400).json({ error: "Failed to update badge" });
  }
});

router.delete("/admin/badges/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(userBadgesTable).where(eq(userBadgesTable.badgeId, id));
    await db.delete(badgesTable).where(eq(badgesTable.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete badge" });
  }
});

export default router;
