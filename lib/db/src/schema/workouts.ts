import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const workoutsTable = pgTable("workouts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  instructor: text("instructor").notNull(),
  durationMin: integer("duration_min").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  equipment: text("equipment").array().notNull().default([]),
  thumbnailUrl: text("thumbnail_url").notNull(),
  description: text("description").notNull(),
  tags: text("tags").array().notNull().default([]),
  videoUrl: text("video_url"),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertWorkoutSchema = createInsertSchema(workoutsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Workout = typeof workoutsTable.$inferSelect;
