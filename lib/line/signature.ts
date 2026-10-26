// LINE signs every webhook request: base64 of HMAC-SHA256(channel secret, raw body) in x-line-signature.
// Must be checked against the raw body text, before any JSON parsing.
import { createHmac, timingSafeEqual } from "node:crypto";

export function verifySignature(rawBody: string, signature: string | null, channelSecret: string): boolean {
  if (!signature || !channelSecret) return false;
  const expected = createHmac("sha256", channelSecret).update(rawBody).digest();
  const given = Buffer.from(signature, "base64");
  return given.length === expected.length && timingSafeEqual(given, expected);
}
