export type DocumentContentFormat = "markdown" | "html";

export function parseDocumentContentFormat(value: string | undefined): DocumentContentFormat {
  const format = value ?? "markdown";
  if (format !== "markdown" && format !== "html") throw new Error("Content format must be markdown or html");
  return format;
}

export function documentContentPath(slug: string, format: DocumentContentFormat): string {
  const endpoint = format === "markdown" ? "markdown" : "raw";
  return `/api/v1/documents/${encodeURIComponent(slug)}/${endpoint}`;
}
