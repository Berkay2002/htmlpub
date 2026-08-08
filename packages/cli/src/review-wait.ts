import type { ReviewRoundStatus } from "@htmlpub/core";

type WaitOptions = {
  intervalMs: number;
  timeoutMs?: number;
  sleep?: (durationMs: number) => Promise<void>;
  now?: () => number;
};

export type ReviewPollState = { roundId: string; status: ReviewRoundStatus; latestEventId: number | null };
export type ReviewWaitResult<T extends ReviewPollState> = T & { timedOut: boolean };

export async function waitForReview<T extends ReviewPollState>(readStatus: (roundId?: string) => Promise<T>, options: WaitOptions): Promise<ReviewWaitResult<T>> {
  const sleep = options.sleep ?? ((durationMs: number) => new Promise<void>((resolve) => setTimeout(resolve, durationMs)));
  const now = options.now ?? Date.now;
  const startedAt = now();
  let status = await readStatus();
  const roundId = status.roundId;

  while (status.status === "open") {
    if (options.timeoutMs !== undefined) {
      const remaining = options.timeoutMs - (now() - startedAt);
      if (remaining <= 0) return { ...status, timedOut: true };
      await sleep(Math.min(options.intervalMs, remaining));
    } else {
      await sleep(options.intervalMs);
    }
    status = await readStatus(roundId);
  }

  return { ...status, timedOut: false };
}
