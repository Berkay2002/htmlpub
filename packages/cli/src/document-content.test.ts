import { describe, expect, it } from "vitest";
import { documentContentPath, parseDocumentContentFormat } from "./document-content";

describe("document content command input", () => {
  it("defaults agents to Markdown and maps both supported formats", () => {
    expect(parseDocumentContentFormat(undefined)).toBe("markdown");
    expect(parseDocumentContentFormat("markdown")).toBe("markdown");
    expect(parseDocumentContentFormat("html")).toBe("html");
    expect(documentContentPath("launch-plan", "markdown")).toBe("/api/v1/documents/launch-plan/markdown");
    expect(documentContentPath("launch-plan", "html")).toBe("/api/v1/documents/launch-plan/raw");
  });

  it("rejects unknown formats", () => {
    expect(() => parseDocumentContentFormat("pdf")).toThrow("markdown or html");
  });
});
