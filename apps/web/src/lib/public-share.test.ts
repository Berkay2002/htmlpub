import { describe, expect, it } from "vitest";
import { publicContentNotFound, publicContentRedirect, publicRawContent } from "./public-share";

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

  it("streams raw HTML as inert source without redirecting to the renderer", async () => {
    const html = "<!doctype html><script>window.parent.document.body.remove()</script>";
    const response = publicRawContent(new Response(html, { status: 200 }), "launch-plan");

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(response.headers.get("content-disposition")).toBe('inline; filename="launch-plan.html"');
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(await response.text()).toBe(html);
  });

  it("does not expose renderer failures through the public raw endpoint", async () => {
    const response = publicRawContent(new Response("internal renderer error", { status: 500 }), "launch-plan");

    expect(response.status).toBe(502);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.text()).toBe("Shared artifact unavailable");
  });
});
