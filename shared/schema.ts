import { mysqlTable, text, serial, varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Resume table schema
export const resumes = mysqlTable("resumes", {
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
