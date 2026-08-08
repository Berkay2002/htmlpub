import type { ReviewStatus } from "@htmlpub/core";

export function mergePolledReview(current: ReviewStatus, updated: ReviewStatus): ReviewStatus {
  const staleReopen = current.roundId === updated.roundId && current.status !== "open" && updated.status === "open";
  return staleReopen ? current : updated;
}
