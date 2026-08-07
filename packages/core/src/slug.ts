const MAX_SLUG_LENGTH = 120;

export function normalizeSlug(input: string): string {
  const normalized = input
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\.html?$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");

  if (!normalized) {
    throw new Error("Slug must contain at least one letter or number");
  }

  return normalized;
}
