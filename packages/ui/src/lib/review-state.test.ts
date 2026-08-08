import { describe, expect, it } from "vitest";
import type { ReviewStatus } from "@htmlpub/core";
import { mergePolledReview } from "./review-state";

function review(roundId: string, status: ReviewStatus["status"]): ReviewStatus {
  return { slug: "plan", title: "Plan", version: roundId === "round-2" ? 2 : 1, roundId, status, comments: [], latestEventId: null, decidedAt: null, agent: { connected: status === "open", acknowledgedAt: null } };
}

describe("review polling state", () => {
  it("ignores a stale reopen response for the same closed round", () => {
    const current = review("round-1", "revision_requested");
    expect(mergePolledReview(current, review("round-1", "open"))).toBe(current);
  });

  it("moves from a closed round to a newly published open round", () => {
    const updated = review("round-2", "open");
    expect(mergePolledReview(review("round-1", "revision_requested"), updated)).toBe(updated);
  });
});
