import { createRepository, getDb } from "@htmlpub/db";
import { appOrigin } from "./env";

let repository: ReturnType<typeof createRepository> | null = null;

export function getRepository() {
  repository ??= createRepository(getDb(), { dashboardOrigin: appOrigin() });
  return repository;
}
