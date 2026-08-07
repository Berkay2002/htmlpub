import { describe, expect, it } from "vitest";
import { MAX_HTML_BYTES, RENDER_TICKET_TTL_MS, createOpaqueToken, createRenderTicket, createShareUrls, normalizeSlug, publishRequestSchema, sha256, tokenMatches, verifyRenderTicket } from "./index";

describe("the publishing contract", () => {
  it("normalizes a filename into a stable URL slug", () => {
    expect(normalizeSlug(" Q3 Architecture Résumé.HTML ")).toBe("q3-architecture-resume");
  });

  it("rejects an HTML payload above the agreed 10 MB limit", () => {
    const result = publishRequestSchema.safeParse({
      slug: "large-report",
      title: "Large report",
      byteSize: MAX_HTML_BYTES + 1,
      sha256: "a".repeat(64),
      filename: "large-report.html"
    });
    expect(result.success).toBe(false);
  });

  it("creates a bearer token that can be checked without storing the secret", () => {
    const created = createOpaqueToken("htmlpub");
    expect(created.token.startsWith("htmlpub_")).toBe(true);
    expect(tokenMatches(created.token, created.hash)).toBe(true);
    expect(tokenMatches(`${created.token}x`, created.hash)).toBe(false);
  });

  it("creates stable reader, Markdown, and raw-content URLs from one revocable share token", () => {
    expect(createShareUrls("https://htmlpub.example.com/dashboard", "share-token")).toEqual({
      url: "https://htmlpub.example.com/s/share-token",
      markdownUrl: "https://htmlpub.example.com/s/share-token/markdown",
      contentUrl: "https://htmlpub.example.com/s/share-token/raw"
    });
  });

  it("accepts an unexpired render ticket and rejects it after thirty days", () => {
    expect(RENDER_TICKET_TTL_MS).toBe(30 * 24 * 60 * 60 * 1000);
    const ticket = createRenderTicket("4a87a1cc-f3f7-4f25-ae22-12f38554dada", "test-secret", 1_000);
    expect(verifyRenderTicket(ticket, "test-secret", 1_000 + RENDER_TICKET_TTL_MS - 1).versionId).toBe("4a87a1cc-f3f7-4f25-ae22-12f38554dada");
    expect(() => verifyRenderTicket(ticket, "test-secret", 1_000 + RENDER_TICKET_TTL_MS)).toThrow("expired");
  });

  it("rejects a render ticket changed by the embedded document", () => {
    const ticket = createRenderTicket("4a87a1cc-f3f7-4f25-ae22-12f38554dada", "test-secret", 1_000);
    expect(() => verifyRenderTicket(`${ticket}x`, "test-secret", 2_000)).toThrow("Invalid render ticket");
  });

  it("uses a known SHA-256 representation for upload identity", () => {
    expect(sha256("htmlpub")).toBe("a12d3a5e85014e1946315895773c66dd1f596f42437986d023a926ba14f08685");
  });
});
