import { createHmac, timingSafeEqual } from "node:crypto";
import { RENDER_TICKET_TTL_MS } from "./contracts";

type RenderTicketPayload = { versionId: string; expiresAt: number };

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
