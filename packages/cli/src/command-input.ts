export const artifactCollections = {
  summary: "Summaries",
  plan: "Plans",
  review: "Reviews",
  report: "Reports"
} as const;

export type ArtifactType = keyof typeof artifactCollections;

export function resolveCollection(type: string | undefined, collection: string | undefined): string | undefined {
  const explicitCollection = collection?.trim();
  if (type && explicitCollection) throw new Error("Use either --type or --collection, not both");
  if (!type) return explicitCollection || undefined;
  if (!(type in artifactCollections)) {
    throw new Error(`Unknown artifact type '${type}'. Expected summary, plan, review, or report`);
  }
  return artifactCollections[type as ArtifactType];
}

export function parseBoundedInteger(value: string, name: string, options: { minimum: number; maximum?: number }): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < options.minimum || (options.maximum !== undefined && parsed > options.maximum)) {
    const range = options.maximum === undefined ? `at least ${options.minimum}` : `between ${options.minimum} and ${options.maximum}`;
    throw new Error(`${name} must be an integer ${range}`);
  }
  return parsed;
}

export function parseDurationMs(value: string, name: string, options: { minimum: number; maximum?: number }): number {
  const match = /^(\d+)(ms|s|m|h)$/.exec(value.trim());
  if (!match) throw new Error(`${name} must be a duration such as 500ms, 30s, 5m, or 1h`);
  const units = { ms: 1, s: 1_000, m: 60_000, h: 3_600_000 } as const;
  const parsed = Number(match[1]) * units[match[2] as keyof typeof units];
  if (!Number.isSafeInteger(parsed) || parsed < options.minimum || (options.maximum !== undefined && parsed > options.maximum)) {
    throw new Error(`${name} must be between ${options.minimum}ms and ${options.maximum ?? Number.MAX_SAFE_INTEGER}ms`);
  }
  return parsed;
}
