import { describe, expect, it } from "vitest";
import { AppError } from "@htmlpub/core";
import { markdownResponse } from "./markdown-response";

describe("the authenticated Markdown response boundary", () => {
  it("streams renderer Markdown with private no-store headers", async () => {
    const response = markdownResponse(new Response("# Launch plan\n", { status: 200 }), "launch-plan");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
    expect(response.headers.get("content-disposition")).toBe('inline; filename="launch-plan.md"');
    expect(response.headers.get("cache-control")).toBe("private, no-store, max-age=0");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(await response.text()).toBe("# Launch plan\n");
  });

  it("does not expose renderer failures as successful Markdown", () => {
    expect(() => markdownResponse(new Response("Renderer failed", { status: 500 }), "launch-plan"))
      .toThrowError(new AppError("markdown_unavailable", "Markdown could not be generated", 502));
  });
});
