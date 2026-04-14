import { Router } from "express";
import { db } from "@workspace/db";
import {
  badgesTable,
  userBadgesTable,
  userXpTable,
  userCompletedWorkoutsTable,
  userStateTable,
  workoutsTable,
} from "@workspace/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";

const router = Router();
const DEFAULT_SESSION_ID = "session-default";

const LEVEL_THRESHOLDS = [
  { level: 1, minXp: 0, name: "Beginner" },
  { level: 2, minXp: 200, name: "Practitioner" },
  { level: 3, minXp: 500, name: "Devotee" },
  { level: 4, minXp: 1000, name: "Expert" },
  { level: 5, minXp: 2000, name: "CoreKaya Master" },
];

function getLevelInfo(totalXp: number) {
  let current = LEVEL_THRESHOLDS[0];
  for (const t of LEVEL_THRESHOLDS) {
    if (totalXp >= t.minXp) current = t;
  }
  const nextIdx = LEVEL_THRESHOLDS.findIndex(t => t.level === current.level) + 1;
  const next = LEVEL_THRESHOLDS[nextIdx] ?? null;
  return {
    level: current.level,
    levelName: current.name,
    xpToNextLevel: next ? next.minXp - totalXp : 0,
    nextLevelXp: next?.minXp ?? null,
    currentLevelMinXp: current.minXp,
  };
}

export async function getOrCreateUserXp(sessionId: string) {
  const [existing] = await db.select().from(userXpTable).where(eq(userXpTable.sessionId, sessionId));
  if (existing) return existing;
  const [created] = await db.insert(userXpTable).values({ sessionId, totalXp: 0, level: 1 }).returning();
  return created;
}

export async function awardXpInternal(sessionId: string, amount: number) {
  const xp = await getOrCreateUserXp(sessionId);
  const newTotal = xp.totalXp + amount;
  const oldInfo = getLevelInfo(xp.totalXp);
  const newInfo = getLevelInfo(newTotal);
  const leveledUp = newInfo.level > oldInfo.level;
  await db.update(userXpTable)
    .set({ totalXp: newTotal, level: newInfo.level })
    .where(eq(userXpTable.sessionId, sessionId));
  return { totalXp: newTotal, leveledUp, newLevel: leveledUp ? newInfo.levelName : null, ...newInfo };
}

export async function checkAndAwardBadges(sessionId: string) {
  const allBadges = await db.select().from(badgesTable);
  const earnedRows = await db.select().from(userBadgesTable).where(eq(userBadgesTable.sessionId, sessionId));
  const earnedIds = new Set(earnedRows.map(r => r.badgeId));

  const completedRows = await db.select().from(userCompletedWorkoutsTable)
    .where(eq(userCompletedWorkoutsTable.sessionId, sessionId));
  const totalCompleted = completedRows.length;

  const [state] = await db.select().from(userStateTable).where(eq(userStateTable.sessionId, sessionId));
  const streak = state?.streak ?? 0;

  const categoryCompletedRows = await db
    .select({ workoutId: userCompletedWorkoutsTable.workoutId })
    .from(userCompletedWorkoutsTable)
    .where(eq(userCompletedWorkoutsTable.sessionId, sessionId));

  let reformerCount = 0;
  let matCount = 0;
  if (categoryCompletedRows.length > 0) {
    const workoutIds = [...new Set(categoryCompletedRows.map(r => r.workoutId))];
    const workouts = await db.select().from(workoutsTable).where(inArray(workoutsTable.id, workoutIds));
    reformerCount = workouts.filter(w => w.category === "Reformer Lab").length;
    matCount = workouts.filter(w => w.category === "Mat Lab").length;
  }

  const newBadges: typeof badgesTable.$inferSelect[] = [];

  for (const badge of allBadges) {
    if (earnedIds.has(badge.id)) continue;

    let met = false;
    if (badge.unlockConditionType === "first_workout") {
      met = totalCompleted >= 1;
    } else if (badge.unlockConditionType === "streak") {
      met = streak >= badge.unlockConditionValue;
    } else if (badge.unlockConditionType === "workouts_completed") {
      met = totalCompleted >= badge.unlockConditionValue;
    } else if (badge.unlockConditionType === "category_count") {
      if (badge.slug === "reformer-initiate") met = reformerCount >= badge.unlockConditionValue;
      else if (badge.slug === "mat-master") met = matCount >= badge.unlockConditionValue;
    }

    if (met) {
      await db.insert(userBadgesTable).values({ sessionId, badgeId: badge.id });
      if (badge.xpReward > 0) {
        await awardXpInternal(sessionId, badge.xpReward);
      }
      newBadges.push(badge);
    }
  }

  return newBadges;
}

router.get("/gamification/status", async (req, res) => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || DEFAULT_SESSION_ID;
    const xp = await getOrCreateUserXp(sessionId);
    const info = getLevelInfo(xp.totalXp);
    const allBadges = await db.select().from(badgesTable);
    const earnedRows = await db.select().from(userBadgesTable).where(eq(userBadgesTable.sessionId, sessionId));
    const earnedMap = new Map(earnedRows.map(r => [r.badgeId, r.earnedAt]));

    const badges = allBadges.map(b => ({
      ...b,
      earned: earnedMap.has(b.id),
      earnedAt: earnedMap.get(b.id) ?? null,
    }));

    res.json({
      totalXp: xp.totalXp,
      level: info.level,
      levelName: info.levelName,
      xpToNextLevel: info.xpToNextLevel,
      nextLevelXp: info.nextLevelXp,
      currentLevelMinXp: info.currentLevelMinXp,
      badges,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get gamification status" });
  }
});

router.post("/gamification/award-xp", async (req, res) => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || DEFAULT_SESSION_ID;
    const { amount } = z.object({ amount: z.number().int().positive(), reason: z.string() }).parse(req.body);
    const result = await awardXpInternal(sessionId, amount);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: "Invalid request" });
  }
});

router.get("/gamification/badges", async (req, res) => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || DEFAULT_SESSION_ID;
    const allBadges = await db.select().from(badgesTable);
    const earnedRows = await db.select().from(userBadgesTable).where(eq(userBadgesTable.sessionId, sessionId));
    const earnedMap = new Map(earnedRows.map(r => [r.badgeId, r.earnedAt]));

    const badges = allBadges.map(b => ({
      ...b,
      earned: earnedMap.has(b.id),
      earnedAt: earnedMap.get(b.id) ?? null,
    }));

    res.json({ badges });
  } catch (err) {
    res.status(500).json({ error: "Failed to get badges" });
  }
});

export default router;
