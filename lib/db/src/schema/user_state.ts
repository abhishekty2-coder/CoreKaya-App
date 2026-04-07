import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userStateTable = pgTable("user_state", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  streak: integer("streak").notNull().default(0),
  lastWorkoutDate: text("last_workout_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const userFavoritesTable = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  workoutId: integer("workout_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userWishlistTable = pgTable("user_wishlist", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userCompletedWorkoutsTable = pgTable("user_completed_workouts", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  workoutId: integer("workout_id").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserStateSchema = createInsertSchema(userStateTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserState = z.infer<typeof insertUserStateSchema>;
export type UserState = typeof userStateTable.$inferSelect;
