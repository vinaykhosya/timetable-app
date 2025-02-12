import { users, timetableEntries, type User, type InsertUser, type TimetableEntry, type InsertTimetable } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getTimetable(branch: string, year: number): Promise<TimetableEntry[]>;
  createTimetableEntry(entry: InsertTimetable): Promise<TimetableEntry>;
  updateTimetableEntry(id: number, entry: Partial<InsertTimetable>): Promise<TimetableEntry>;
  deleteTimetableEntry(id: number): Promise<void>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, isAdmin: false })
      .returning();
    return user;
  }

  async getTimetable(branch: string, year: number): Promise<TimetableEntry[]> {
    return db.select()
      .from(timetableEntries)
      .where(
        and(
          eq(timetableEntries.branch, branch),
          eq(timetableEntries.year, year)
        )
      );
  }

  async createTimetableEntry(entry: InsertTimetable): Promise<TimetableEntry> {
    const [created] = await db
      .insert(timetableEntries)
      .values(entry)
      .returning();
    return created;
  }

  async updateTimetableEntry(id: number, entry: Partial<InsertTimetable>): Promise<TimetableEntry> {
    const [updated] = await db
      .update(timetableEntries)
      .set(entry)
      .where(eq(timetableEntries.id, id))
      .returning();
    return updated;
  }

  async deleteTimetableEntry(id: number): Promise<void> {
    await db
      .delete(timetableEntries)
      .where(eq(timetableEntries.id, id));
  }
}

export const storage = new DatabaseStorage();