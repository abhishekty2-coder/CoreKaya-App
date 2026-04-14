import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const userXpTable = pgTable("user_xp", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  totalXp: integer("total_xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const badgesTable = pgTable("badges", {
  id: serial("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconEmoji: text("icon_emoji").notNull(),
  xpReward: integer("xp_reward").notNull().default(0),
  unlockConditionType: text("unlock_condition_type").notNull(),
  unlockConditionValue: integer("unlock_condition_value").notNull(),
});

export const userBadgesTable = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  badgeId: integer("badge_id").references(() => badgesTable.id),
  earnedAt: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userBodyCheckinsTable = pgTable("user_body_checkins", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  workoutId: integer("workout_id").notNull(),
  feeling: text("feeling").notNull(),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userOnboardingTable = pgTable("user_onboarding", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").unique().notNull(),
  goal: text("goal"),
  experienceLevel: text("experience_level"),
  equipmentOwned: text("equipment_owned").array().default([]),
  daysPerWeek: integer("days_per_week"),
  isComplete: boolean("is_complete").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const streakShieldsTable = pgTable("streak_shields", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  shieldsAvailable: integer("shields_available").notNull().default(1),
  lastEarnedAt: timestamp("last_earned_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
