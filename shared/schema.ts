import { pgTable, text, serial, integer, boolean, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  rollNumber: text("roll_number").notNull().unique(),
  branch: text("branch").notNull(),
  year: integer("year").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const timetableEntries = pgTable("timetable_entries", {
  id: serial("id").primaryKey(),
  branch: text("branch").notNull(),
  year: integer("year").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 for Sunday-Saturday
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  subject: text("subject").notNull(),
  room: text("room").notNull(),
});

export const insertUserSchema = createInsertSchema(users).extend({
  rollNumber: z.string().length(11),
  branch: z.enum(["ECAM1", "ECAM2", "CSDA", "CSIOT"]),
  year: z.number().min(1).max(4),
});

export const insertTimetableSchema = createInsertSchema(timetableEntries);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;
export type TimetableEntry = typeof timetableEntries.$inferSelect;

export const BRANCHES = ["ECAM1", "ECAM2", "CSDA", "CSIOT"] as const;
export const YEARS = [1, 2, 3, 4] as const;