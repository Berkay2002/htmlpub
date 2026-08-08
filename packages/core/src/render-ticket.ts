import { createHmac, timingSafeEqual } from "node:crypto";
import { RENDER_TICKET_TTL_MS, REVIEW_TICKET_TTL_MS } from "./contracts";

type RenderTicketPayload = { versionId: string; expiresAt: number };
export type ReviewTicketPayload = {
  ownerId: string;
  slug: string;
  versionId: string;
  roundId: string;
  expiresAt: number;
};
export type CreateReviewTicketInput = Omit<ReviewTicketPayload, "expiresAt">;

function sign(encodedPayload: string, secret: string): string {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

export function createRenderTicket(versionId: string, secret: string, now = Date.now()): string {
  if (!secret) throw new Error("Render ticket secret is required");
  const encodedPayload = Buffer.from(JSON.stringify({ versionId, expiresAt: now + RENDER_TICKET_TTL_MS } satisfies RenderTicketPayload)).toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload, secret)}`;
}

export function verifyRenderTicket(ticket: string, secret: string, now = Date.now()): RenderTicketPayload {
  const [encodedPayload, signature, extra] = ticket.split(".");
  if (!encodedPayload || !signature || extra) throw new Error("Invalid render ticket");
  const actual = Buffer.from(signature);
  const expected = Buffer.from(sign(encodedPayload, secret));
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error("Invalid render ticket");

  let payload: RenderTicketPayload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as RenderTicketPayload;
  } catch {
    throw new Error("Invalid render ticket");
  }

  if (typeof payload.versionId !== "string" || typeof payload.expiresAt !== "number") throw new Error("Invalid render ticket");
  if (payload.expiresAt <= now) throw new Error("Render ticket expired");
  return payload;
}

export function createReviewTicket(input: CreateReviewTicketInput, secret: string, now = Date.now()): string {
  if (!secret) throw new Error("Review ticket secret is required");
  const encodedPayload = Buffer.from(JSON.stringify({ ...input, expiresAt: now + REVIEW_TICKET_TTL_MS } satisfies ReviewTicketPayload)).toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload, secret)}`;
}

export function verifyReviewTicket(ticket: string, secret: string, now = Date.now()): ReviewTicketPayload {
  const [encodedPayload, signature, extra] = ticket.split(".");
  if (!encodedPayload || !signature || extra) throw new Error("Invalid review ticket");
  const actual = Buffer.from(signature);
  const expected = Buffer.from(sign(encodedPayload, secret));
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error("Invalid review ticket");

  let payload: ReviewTicketPayload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as ReviewTicketPayload;
  } catch {
    throw new Error("Invalid review ticket");
  }

  if (
    typeof payload.ownerId !== "string" || !payload.ownerId ||
    typeof payload.slug !== "string" || !payload.slug ||
    typeof payload.versionId !== "string" || !payload.versionId ||
    typeof payload.roundId !== "string" || !payload.roundId ||
    typeof payload.expiresAt !== "number"
  ) throw new Error("Invalid review ticket");
  if (payload.expiresAt <= now) throw new Error("Review ticket expired");
  return payload;
}
