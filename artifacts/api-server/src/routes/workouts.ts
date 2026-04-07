import { Router } from "express";
import { db } from "@workspace/db";
import { workoutsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

function mapWorkout(w: typeof workoutsTable.$inferSelect) {
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

router.get("/workouts", async (req, res) => {
  try {
    const { category, difficulty } = req.query as Record<string, string>;
    let rows = await db.select().from(workoutsTable);
    if (category) rows = rows.filter((w) => w.category === category);
    if (difficulty) rows = rows.filter((w) => w.difficulty === difficulty);
    res.json(rows.map(mapWorkout));
  } catch (err) {
    res.status(500).json({ error: "Failed to list workouts" });
  }
});

router.post("/workouts", async (req, res) => {
  try {
    const schema = z.object({
      title: z.string(),
      instructor: z.string(),
      durationMin: z.number().int(),
      category: z.string(),
      difficulty: z.string(),
      equipment: z.array(z.string()).optional(),
      thumbnailUrl: z.string(),
      description: z.string(),
      tags: z.array(z.string()).optional(),
      videoUrl: z.string().nullable().optional(),
      isPublished: z.boolean().optional(),
    });
    const parsed = schema.parse(req.body);
    const [row] = await db.insert(workoutsTable).values({
      title: parsed.title,
      instructor: parsed.instructor,
      durationMin: parsed.durationMin,
      category: parsed.category,
      difficulty: parsed.difficulty,
      equipment: parsed.equipment ?? [],
      thumbnailUrl: parsed.thumbnailUrl,
      description: parsed.description,
      tags: parsed.tags ?? [],
      videoUrl: parsed.videoUrl ?? null,
      isPublished: parsed.isPublished ?? true,
    }).returning();
    res.status(201).json(mapWorkout(row));
  } catch (err) {
    res.status(400).json({ error: "Invalid workout data" });
  }
});

router.get("/workouts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [row] = await db.select().from(workoutsTable).where(eq(workoutsTable.id, id));
    if (!row) return res.status(404).json({ error: "Workout not found" });
    res.json(mapWorkout(row));
  } catch (err) {
    res.status(500).json({ error: "Failed to get workout" });
  }
});

router.patch("/workouts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const schema = z.object({
      title: z.string().optional(),
      instructor: z.string().optional(),
      durationMin: z.number().int().optional(),
      category: z.string().optional(),
      difficulty: z.string().optional(),
      equipment: z.array(z.string()).optional(),
      thumbnailUrl: z.string().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
      videoUrl: z.string().nullable().optional(),
      isPublished: z.boolean().optional(),
    });
    const parsed = schema.parse(req.body);
    const [row] = await db.update(workoutsTable).set(parsed).where(eq(workoutsTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Workout not found" });
    res.json(mapWorkout(row));
  } catch (err) {
    res.status(400).json({ error: "Invalid update data" });
  }
});

router.delete("/workouts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await db.delete(workoutsTable).where(eq(workoutsTable.id, id)).returning();
    if (!deleted.length) return res.status(404).json({ error: "Workout not found" });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete workout" });
  }
});

export default router;
