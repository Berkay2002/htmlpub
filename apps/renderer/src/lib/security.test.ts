import { describe, expect, it } from "vitest";
import { rendererErrorHeaders, rendererHeaders, SANDBOX_TOKENS } from "./security";

describe("the renderer response boundary", () => {
  it("allows report scripts without granting same-origin, forms, or top navigation", () => {
    expect(SANDBOX_TOKENS).toContain("allow-scripts");
    expect(SANDBOX_TOKENS).not.toContain("allow-same-origin");
    expect(SANDBOX_TOKENS).not.toContain("allow-forms");
    expect(SANDBOX_TOKENS).not.toContain("allow-top-navigation");
  });

  it("prevents referrer leakage and limits embedding to the main app", () => {
    const headers = new Headers(rendererHeaders("https://app.example.com"));
    expect(headers.get("referrer-policy")).toBe("no-referrer");
    expect(headers.get("content-security-policy")).toContain("frame-ancestors https://app.example.com");
    expect(headers.get("content-security-policy")).toContain("form-action 'none'");
  });

  it("keeps the renderer boundary on error responses", () => {
    const headers = rendererErrorHeaders("https://app.example.com");
    expect(headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(headers.get("content-security-policy")).toContain("sandbox allow-scripts");
    expect(headers.get("referrer-policy")).toBe("no-referrer");
    expect(headers.get("x-content-type-options")).toBe("nosniff");
  });
});
