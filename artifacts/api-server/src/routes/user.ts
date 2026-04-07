import { Router } from "express";
import { db } from "@workspace/db";
import {
  userStateTable,
  userFavoritesTable,
  userWishlistTable,
  userCompletedWorkoutsTable,
} from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

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

    res.json({
      streak: newStreak,
      completedWorkouts: uniqueWorkouts,
      lastWorkoutDate: today,
    });
  } catch (err) {
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
