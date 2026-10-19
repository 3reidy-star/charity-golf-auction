import { randomInt } from "node:crypto";

export function parseNames(value: string) {
  const names = value.split(/\r?\n/).map(name => name.normalize("NFKC").trim().replace(/\s+/g, " ")).filter(Boolean);
  if (!names.length || names.length > 200) throw new Error("Enter between 1 and 200 paid guests, one name per line.");
  if (names.some(name => name.length > 100)) throw new Error("Names must be 100 characters or fewer.");
  const entries = names.map(name => ({ name, nameKey: name.toLocaleLowerCase("en-GB") }));
  if (new Set(entries.map(e => e.nameKey)).size !== entries.length) throw new Error("A name appears more than once. Each person gets one entry; use an initial or extra detail to distinguish people with the same name.");
  return entries;
}

// Partial Fisher-Yates shuffle: equal chances, no replacement, and no changes
// to the original list. Use the server's cryptographic random source.
export function selectThree<T>(entries: readonly T[], pick: (max: number) => number = randomInt): T[] {
  if (entries.length < 3) throw new Error("Add at least three paid guests before drawing the winners.");
  const pool = [...entries];
  for (let i = 0; i < 3; i++) {
    const j = i + pick(pool.length - i);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3);
}
