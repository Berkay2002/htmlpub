import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

neonConfig.webSocketConstructor = ws;

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  return drizzle({ client: new Pool({ connectionString: url }), schema });
}

let instance: ReturnType<typeof createDb> | null = null;

export function getDb() {
  instance ??= createDb();
  return instance;
}

export type HtmlpubDb = ReturnType<typeof getDb>;
