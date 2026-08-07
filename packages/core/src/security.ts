import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

export function createOpaqueToken(prefix: "htmlpub" | "share" = "share"): { token: string; hash: string; displayPrefix: string } {
  const secret = randomBytes(32).toString("base64url");
  const token = prefix === "htmlpub" ? `htmlpub_${secret}` : secret;
  return { token, hash: sha256(token), displayPrefix: token.slice(0, prefix === "htmlpub" ? 16 : 10) };
}

export function createShareUrls(origin: string, token: string): { url: string; contentUrl: string } {
  const shareUrl = new URL(`/s/${encodeURIComponent(token)}`, new URL(origin).origin);
  return { url: shareUrl.toString(), contentUrl: new URL(`${shareUrl.pathname}/raw`, shareUrl.origin).toString() };
}

export function tokenMatches(token: string, expectedHash: string): boolean {
  const actual = Buffer.from(sha256(token), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
