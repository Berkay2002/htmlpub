import { describe, expect, it } from "vitest";
import { createReviewUrl } from "./render";

describe("renderer review links", () => {
  it("keeps the review capability in the fragment so servers and referrers do not receive it", () => {
    const url = createReviewUrl({
      ownerId: "user_owner",
      slug: "launch-plan",
      versionId: "4a87a1cc-f3f7-4f25-ae22-12f38554dada",
      roundId: "13ab755f-d61c-4b3f-825d-327260c4a3ee"
    }, { origin: "https://renderer.example.com", secret: "test-secret", now: 1_000 });

    expect(url.startsWith("https://renderer.example.com/review#")).toBe(true);
    expect(new URL(url).search).toBe("");
  });
});
