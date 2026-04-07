import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const schedulesTable = pgTable("schedules", {
  id: serial("id").primaryKey(),
  startDate: text("start_date").notNull(),
  mon: integer("mon"),
  tue: integer("tue"),
  wed: integer("wed"),
  thu: integer("thu"),
  fri: integer("fri"),
  sat: integer("sat"),
  sun: integer("sun"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertScheduleSchema = createInsertSchema(schedulesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedulesTable.$inferSelect;
