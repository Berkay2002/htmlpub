import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  return drizzle(neon(url), { schema });
}

let instance: ReturnType<typeof createDb> | null = null;

export function getDb() {
  instance ??= createDb();
  return instance;
}

export type HtmlpubDb = ReturnType<typeof getDb>;
