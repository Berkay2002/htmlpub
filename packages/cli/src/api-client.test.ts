import { afterEach, describe, expect, it, vi } from "vitest";
import { CliApiError, HtmlpubApiClient } from "./api-client";

afterEach(() => vi.unstubAllGlobals());

describe("the CLI content response boundary", () => {
  it("retrieves non-JSON response bytes without rewriting them", async () => {
    const bytes = Uint8Array.from([0xef, 0xbb, 0xbf, 0x3c, 0x68, 0x31, 0x3e, 0xc3, 0xa5]);
    const fetchMock = vi.fn().mockResolvedValue(new Response(bytes, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await new HtmlpubApiClient("https://htmlpub.example", "htmlpub_secret").requestBytes(
      "GET",
      "/api/v1/documents/launch-plan/raw"
    );

    expect(result).toEqual(bytes);
    expect(fetchMock).toHaveBeenCalledWith(new URL("https://htmlpub.example/api/v1/documents/launch-plan/raw"), expect.objectContaining({
      method: "GET",
      headers: { authorization: "Bearer htmlpub_secret" }
    }));
  });

  it("preserves structured API errors for failed content requests", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({
      ok: false,
      error: { code: "document_not_found", message: "Document not found" }
    }, { status: 404 })));

    await expect(new HtmlpubApiClient("https://htmlpub.example", "htmlpub_secret").requestBytes(
      "GET",
      "/api/v1/documents/missing/raw"
    )).rejects.toEqual(new CliApiError("document_not_found", "Document not found", 404));
  });
});
