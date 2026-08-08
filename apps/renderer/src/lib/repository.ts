import { createRepository, getDb } from "@htmlpub/db";

let repository: ReturnType<typeof createRepository> | null = null;

export function getRepository() {
  repository ??= createRepository(getDb(), { dashboardOrigin: process.env.APP_ORIGIN ?? "http://localhost:3000" });
  return repository;
}
