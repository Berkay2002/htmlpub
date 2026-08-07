import { describe, expect, it } from "vitest";
import { publicContentNotFound, publicContentRedirect } from "./public-share";

describe("the public content boundary", () => {
  it("redirects stable bearer links without allowing caches or referrer leakage", () => {
    const response = publicContentRedirect("https://renderer.example.com/render/signed-ticket");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://renderer.example.com/render/signed-ticket");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("does not reveal whether a revoked token once existed", async () => {
    const response = publicContentNotFound();
    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.text()).toBe("Shared artifact not found");
  });
});
