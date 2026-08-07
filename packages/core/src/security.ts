import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

export function createOpaqueToken(prefix: "htmlpub" | "share" = "share"): { token: string; hash: string; displayPrefix: string } {
  const secret = randomBytes(32).toString("base64url");
  const token = prefix === "htmlpub" ? `htmlpub_${secret}` : secret;
  return { token, hash: sha256(token), displayPrefix: token.slice(0, prefix === "htmlpub" ? 16 : 10) };
}

export function tokenMatches(token: string, expectedHash: string): boolean {
  const actual = Buffer.from(sha256(token), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
