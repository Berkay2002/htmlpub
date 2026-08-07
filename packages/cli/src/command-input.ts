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
