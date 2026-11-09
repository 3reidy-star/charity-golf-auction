import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { ELECTION_ID } from "./config";
export const VOTER_COOKIE = "committee_voter_2026";
export function makeVoterToken(secret: string) {
  const id = randomUUID();
  return `${id}.${createHmac("sha256", secret).update(`${ELECTION_ID}:${id}`).digest("hex")}`;
}
export function voterHash(token: string | undefined, secret: string) {
  if (!token || !secret) return null;
  const match = token.match(/^([a-f0-9-]{36})\.([a-f0-9]{64})$/);
  if (!match) return null;
  const expected = createHmac("sha256", secret).update(`${ELECTION_ID}:${match[1]}`).digest("hex");
  if (!timingSafeEqual(Buffer.from(match[2]), Buffer.from(expected))) return null;
  return createHash("sha256").update(`${ELECTION_ID}:${match[1]}`).digest("hex");
}
