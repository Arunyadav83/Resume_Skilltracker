import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Resume table schema
export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  summary: text("summary"),
  education: text("education"),
  experience: text("experience"),
  personalInformation: text("personal_information"),
});

export const resumeInsertSchema = createInsertSchema(resumes);
export const resumeSelectSchema = createInsertSchema(resumes);

export type ResumeInsert = z.infer<typeof resumeInsertSchema>;
export type Resume = typeof resumes.$inferSelect;
