import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Please set it in your .env file.");
}

export default defineConfig({
  out: "./db/migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql", // Change this to 'mysql'
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
});
