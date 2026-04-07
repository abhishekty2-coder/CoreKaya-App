import { Router } from "express";
import { db } from "@workspace/db";
import { schedulesTable, workoutsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

function mapWorkout(w: typeof workoutsTable.$inferSelect | undefined | null) {
  if (!w) return null;
  return {
    id: w.id,
    title: w.title,
    instructor: w.instructor,
    durationMin: w.durationMin,
    category: w.category,
    difficulty: w.difficulty,
    equipment: w.equipment,
    thumbnailUrl: w.thumbnailUrl,
    description: w.description,
    tags: w.tags,
    videoUrl: w.videoUrl,
    isPublished: w.isPublished,
    createdAt: w.createdAt.toISOString(),
  };
}

async function getScheduleWithWorkouts(schedule: typeof schedulesTable.$inferSelect) {
  const dayIds = [schedule.mon, schedule.tue, schedule.wed, schedule.thu, schedule.fri, schedule.sat, schedule.sun];
  const uniqueIds = [...new Set(dayIds.filter((id): id is number => id !== null))];

  let workoutsMap: Map<number, typeof workoutsTable.$inferSelect> = new Map();
  if (uniqueIds.length > 0) {
    const workouts = await db.select().from(workoutsTable);
    workouts.forEach((w) => workoutsMap.set(w.id, w));
  }

  return {
    id: schedule.id,
    startDate: schedule.startDate,
    mon: schedule.mon,
    tue: schedule.tue,
    wed: schedule.wed,
    thu: schedule.thu,
    fri: schedule.fri,
    sat: schedule.sat,
    sun: schedule.sun,
    monWorkout: schedule.mon ? mapWorkout(workoutsMap.get(schedule.mon)) : null,
    tueWorkout: schedule.tue ? mapWorkout(workoutsMap.get(schedule.tue)) : null,
    wedWorkout: schedule.wed ? mapWorkout(workoutsMap.get(schedule.wed)) : null,
    thuWorkout: schedule.thu ? mapWorkout(workoutsMap.get(schedule.thu)) : null,
    friWorkout: schedule.fri ? mapWorkout(workoutsMap.get(schedule.fri)) : null,
    satWorkout: schedule.sat ? mapWorkout(workoutsMap.get(schedule.sat)) : null,
    sunWorkout: schedule.sun ? mapWorkout(workoutsMap.get(schedule.sun)) : null,
  };
}

router.get("/schedule/current", async (req, res) => {
  try {
    const rows = await db.select().from(schedulesTable).orderBy(schedulesTable.id);
    if (!rows.length) {
      return res.status(404).json({ error: "No schedule found" });
    }
    const schedule = rows[rows.length - 1];
    res.json(await getScheduleWithWorkouts(schedule));
  } catch (err) {
    res.status(500).json({ error: "Failed to get schedule" });
  }
});

router.put("/schedule/current", async (req, res) => {
  try {
    const schema = z.object({
      startDate: z.string(),
      mon: z.number().int().nullable().optional(),
      tue: z.number().int().nullable().optional(),
      wed: z.number().int().nullable().optional(),
      thu: z.number().int().nullable().optional(),
      fri: z.number().int().nullable().optional(),
      sat: z.number().int().nullable().optional(),
      sun: z.number().int().nullable().optional(),
    });
    const parsed = schema.parse(req.body);

    const rows = await db.select().from(schedulesTable).orderBy(schedulesTable.id);
    let schedule: typeof schedulesTable.$inferSelect;

    if (!rows.length) {
      const [newRow] = await db.insert(schedulesTable).values({
        startDate: parsed.startDate,
        mon: parsed.mon ?? null,
        tue: parsed.tue ?? null,
        wed: parsed.wed ?? null,
        thu: parsed.thu ?? null,
        fri: parsed.fri ?? null,
        sat: parsed.sat ?? null,
        sun: parsed.sun ?? null,
      }).returning();
      schedule = newRow;
    } else {
      const existing = rows[rows.length - 1];
      const [updated] = await db.update(schedulesTable)
        .set({
          startDate: parsed.startDate,
          mon: parsed.mon !== undefined ? parsed.mon : existing.mon,
          tue: parsed.tue !== undefined ? parsed.tue : existing.tue,
          wed: parsed.wed !== undefined ? parsed.wed : existing.wed,
          thu: parsed.thu !== undefined ? parsed.thu : existing.thu,
          fri: parsed.fri !== undefined ? parsed.fri : existing.fri,
          sat: parsed.sat !== undefined ? parsed.sat : existing.sat,
          sun: parsed.sun !== undefined ? parsed.sun : existing.sun,
        })
        .where(eq(schedulesTable.id, existing.id))
        .returning();
      schedule = updated;
    }

    res.json(await getScheduleWithWorkouts(schedule));
  } catch (err) {
    res.status(400).json({ error: "Invalid schedule data" });
  }
});

export default router;
