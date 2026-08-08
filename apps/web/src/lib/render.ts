import { createRenderTicket, createReviewTicket, type CreateReviewTicketInput } from "@htmlpub/core";
import { rendererOrigin, renderSecret } from "./env";

export type RenderMode = "raw" | "reader" | "markdown";

export function renderUrl(versionId: string, mode: RenderMode = "raw"): string {
  const ticket = createRenderTicket(versionId, renderSecret());
  const query = mode === "raw" ? "" : `?mode=${mode}`;
  return `${rendererOrigin()}/render/${encodeURIComponent(ticket)}${query}`;
}

export function createReviewUrl(
  input: CreateReviewTicketInput,
  options: { origin?: string; secret?: string; now?: number } = {}
): string {
  const origin = options.origin ?? rendererOrigin();
  const secret = options.secret ?? renderSecret();
  const ticket = createReviewTicket(input, secret, options.now);
  return `${origin}/review#${ticket}`;
}
