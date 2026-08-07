import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://htmlpub:htmlpub@localhost:5432/htmlpub"
  },
  strict: true,
  verbose: true
});
