import { AppError } from "@htmlpub/core";
import { describe, expect, it } from "vitest";
import { rawResponse } from "./raw-response";

describe("the authenticated raw HTML response boundary", () => {
  it("streams exact HTML bytes as inert source", async () => {
    const bytes = Uint8Array.from([0xef, 0xbb, 0xbf, 0x3c, 0x68, 0x31, 0x3e, 0xc3, 0xa5]);
    const response = rawResponse(new Response(bytes, { status: 200 }), "launch-plan");

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(response.headers.get("content-disposition")).toBe('inline; filename="launch-plan.html"');
    expect(response.headers.get("cache-control")).toBe("private, no-store, max-age=0");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes);
  });

  it("does not expose renderer failures as successful content", () => {
    expect(() => rawResponse(new Response("Renderer failed", { status: 500 }), "launch-plan"))
      .toThrowError(new AppError("raw_unavailable", "Raw HTML could not be retrieved", 502));
  });
});
