import { describe, expect, it } from "vitest";
import { agentPrompt } from "./agent-prompt";

describe("the Share to agent prompt", () => {
  it("includes an authenticated CLI fallback without duplicating artifact content", () => {
    const prompt = agentPrompt({
      title: "Launch plan",
      slug: "launch-plan",
      rawUrl: "https://htmlpub.example/s/token/raw"
    });

    expect(prompt).toContain("Raw HTML: https://htmlpub.example/s/token/raw");
    expect(prompt).toContain("htmlpub documents content launch-plan --format markdown");
    expect(prompt).toContain("htmlpub documents content launch-plan --format html");
    expect(prompt).toContain("If web retrieval is blocked and an authenticated htmlpub CLI is available:");
  });
});
