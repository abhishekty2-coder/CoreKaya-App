import { Router } from "express";
import { db } from "@workspace/db";
import {
  userStateTable,
  userFavoritesTable,
  userWishlistTable,
  userCompletedWorkoutsTable,
  userBodyCheckinsTable,
  userOnboardingTable,
  streakShieldsTable,
  workoutsTable,
} from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { checkAndAwardBadges, awardXpInternal, getOrCreateUserXp } from "./gamification";

const router = Router();

const DEFAULT_SESSION_ID = "session-default";

async function getOrCreateUserState(sessionId: string) {
  const [existing] = await db.select().from(userStateTable).where(eq(userStateTable.sessionId, sessionId));
  if (existing) return existing;
  const [created] = await db.insert(userStateTable).values({ sessionId, streak: 0 }).returning();
  return created;
}

router.get("/user/favorites", async (req, res) => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || DEFAULT_SESSION_ID;
    const rows = await db.select().from(userFavoritesTable).where(eq(userFavoritesTable.sessionId, sessionId));
    res.json({ favorites: rows.map((r) => r.workoutId) });
  } catch (err) {
    res.status(500).json({ error: "Failed to get favorites" });
  }
});

router.post("/user/favorites", async (req, res) => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || DEFAULT_SESSION_ID;
    const { workoutId } = z.object({ workoutId: z.number().int() }).parse(req.body);

    const existing = await db.select().from(userFavoritesTable)
      .where(and(eq(userFavoritesTable.sessionId, sessionId), eq(userFavoritesTable.workoutId, workoutId)));

    if (existing.length > 0) {
      await db.delete(userFavoritesTable)
        .where(and(eq(userFavoritesTable.sessionId, sessionId), eq(userFavoritesTable.workoutId, workoutId)));
    } else {
      await db.insert(userFavoritesTable).values({ sessionId, workoutId });
    }

    const rows = await db.select().from(userFavoritesTable).where(eq(userFavoritesTable.sessionId, sessionId));
    res.json({ favorites: rows.map((r) => r.workoutId) });
  } catch (err) {
    res.status(400).json({ error: "Invalid request" });
  }
});

router.get("/user/wishlist", async (req, res) => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || DEFAULT_SESSION_ID;
    const rows = await db.select().from(userWishlistTable).where(eq(userWishlistTable.sessionId, sessionId));
    res.json({ wishlist: rows.map((r) => r.productId) });
  } catch (err) {
    res.status(500).json({ error: "Failed to get wishlist" });
  }
});

router.post("/user/wishlist", async (req, res) => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || DEFAULT_SESSION_ID;
    const { productId } = z.object({ productId: z.number().int() }).parse(req.body);

    const existing = await db.select().from(userWishlistTable)
      .where(and(eq(userWishlistTable.sessionId, sessionId), eq(userWishlistTable.productId, productId)));

    if (existing.length > 0) {
      await db.delete(userWishlistTable)
        .where(and(eq(userWishlistTable.sessionId, sessionId), eq(userWishlistTable.productId, productId)));
    } else {
      await db.insert(userWishlistTable).values({ sessionId, productId });
    }

    const rows = await db.select().from(userWishlistTable).where(eq(userWishlistTable.sessionId, sessionId));
    res.json({ wishlist: rows.map((r) => r.productId) });
  } catch (err) {
    res.status(400).json({ error: "Invalid request" });
  }
});

router.get("/user/progress", async (req, res) => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || DEFAULT_SESSION_ID;
    const state = await getOrCreateUserState(sessionId);
    const completedRows = await db.select().from(userCompletedWorkoutsTable)
      .where(eq(userCompletedWorkoutsTable.sessionId, sessionId));
    const uniqueWorkouts = [...new Set(completedRows.map((r) => r.workoutId))];
    res.json({
      streak: state.streak,
      completedWorkouts: uniqueWorkouts,
      lastWorkoutDate: state.lastWorkoutDate,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get progress" });
  }
});

router.post("/user/progress", async (req, res) => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || DEFAULT_SESSION_ID;
    const { workoutId } = z.object({ workoutId: z.number().int() }).parse(req.body);

    await db.insert(userCompletedWorkoutsTable).values({ sessionId, workoutId });

    const today = new Date().toISOString().split("T")[0];
    const state = await getOrCreateUserState(sessionId);

    let newStreak = state.streak;
    if (state.lastWorkoutDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      if (state.lastWorkoutDate === yesterdayStr) {
        newStreak = state.streak + 1;
      } else {
        newStreak = 1;
      }
      await db.update(userStateTable)
        .set({ streak: newStreak, lastWorkoutDate: today })
        .where(eq(userStateTable.sessionId, sessionId));
    }

    const completedRows = await db.select().from(userCompletedWorkoutsTable)
      .where(eq(userCompletedWorkoutsTable.sessionId, sessionId));
    const uniqueWorkouts = [...new Set(completedRows.map((r) => r.workoutId))];

    const baseXpResult = await awardXpInternal(sessionId, 10);
    const newBadges = await checkAndAwardBadges(sessionId);
    const finalXp = await getOrCreateUserXp(sessionId);

    res.json({
      streak: newStreak,
      completedWorkouts: uniqueWorkouts,
      lastWorkoutDate: today,
      newBadges,
      xpEarned: 10,
      newLevel: baseXpResult.leveledUp ? baseXpResult.newLevel : null,
      totalXp: finalXp.totalXp,
    });
  } catch (err) {
    res.status(400).json({ error: "Invalid request" });
  }
});

router.post("/user/checkin", async (req, res) => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || DEFAULT_SESSION_ID;
    const { workoutId, feeling } = z.object({
      workoutId: z.number().int(),
      feeling: z.enum(["easy", "good", "tough"]),
    }).parse(req.body);

    const [row] = await db.insert(userBodyCheckinsTable)
      .values({ sessionId, workoutId, feeling })
      .returning();
    res.json(row);
  } catch (err) {
    res.status(400).json({ error: "Invalid request" });
  }
});

router.get("/user/checkin-history", async (req, res) => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || DEFAULT_SESSION_ID;
    const rows = await db
      .select({
        id: userBodyCheckinsTable.id,
        sessionId: userBodyCheckinsTable.sessionId,
        workoutId: userBodyCheckinsTable.workoutId,
        feeling: userBodyCheckinsTable.feeling,
        checkedInAt: userBodyCheckinsTable.checkedInAt,
        workoutTitle: workoutsTable.title,
      })
      .from(userBodyCheckinsTable)
      .leftJoin(workoutsTable, eq(userBodyCheckinsTable.workoutId, workoutsTable.id))
      .where(eq(userBodyCheckinsTable.sessionId, sessionId))
      .orderBy(desc(userBodyCheckinsTable.checkedInAt))
      .limit(20);
    res.json({ history: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to get check-in history" });
  }
});

router.get("/user/onboarding", async (req, res) => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || DEFAULT_SESSION_ID;
    const [row] = await db.select().from(userOnboardingTable).where(eq(userOnboardingTable.sessionId, sessionId));
    if (!row) {
      res.json({ isComplete: false });
      return;
    }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to get onboarding" });
  }
});

router.post("/user/onboarding", async (req, res) => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || DEFAULT_SESSION_ID;
    const { goal, experienceLevel, equipmentOwned, daysPerWeek } = z.object({
      goal: z.string(),
      experienceLevel: z.string(),
      equipmentOwned: z.array(z.string()),
      daysPerWeek: z.number().int(),
    }).parse(req.body);

    const [existing] = await db.select().from(userOnboardingTable).where(eq(userOnboardingTable.sessionId, sessionId));
    let row;
    if (existing) {
      [row] = await db.update(userOnboardingTable)
        .set({ goal, experienceLevel, equipmentOwned, daysPerWeek, isComplete: true, completedAt: new Date() })
        .where(eq(userOnboardingTable.sessionId, sessionId))
        .returning();
    } else {
      [row] = await db.insert(userOnboardingTable)
        .values({ sessionId, goal, experienceLevel, equipmentOwned, daysPerWeek, isComplete: true, completedAt: new Date() })
        .returning();
    }
    res.json(row);
  } catch (err) {
    res.status(400).json({ error: "Invalid request" });
  }
});

router.post("/user/streak-shield", async (req, res) => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || DEFAULT_SESSION_ID;
    const [shield] = await db.select().from(streakShieldsTable).where(eq(streakShieldsTable.sessionId, sessionId));

    if (!shield || shield.shieldsAvailable <= 0) {
      res.json({ used: false, shieldsRemaining: 0 });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const newAvailable = shield.shieldsAvailable - 1;

    await db.update(streakShieldsTable)
      .set({ shieldsAvailable: newAvailable })
      .where(eq(streakShieldsTable.sessionId, sessionId));

    const [state] = await db.select().from(userStateTable).where(eq(userStateTable.sessionId, sessionId));
    if (state) {
      await db.update(userStateTable)
        .set({ lastWorkoutDate: today })
        .where(eq(userStateTable.sessionId, sessionId));
    }

    res.json({ used: true, shieldsRemaining: newAvailable });
  } catch (err) {
    res.status(500).json({ error: "Failed to use streak shield" });
  }
});

export default router;
