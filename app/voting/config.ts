export const ELECTION_ID = "committee-2026";
export const ABSTAIN = "abstain";
export const ROLES = [
  { id: "newMembers", title: "New Members Role", candidates: [
    { id: "jose-cubides", name: "Jose Cubides" },
    { id: "joe-andrews", name: "Joe Andrews" },
    { id: "adrian-baines", name: "Adrian Baines" },
  ] },
  { id: "media", title: "Media", candidates: [
    { id: "joe-andrews", name: "Joe Andrews" },
    { id: "carl-thomas", name: "Carl Thomas" },
  ] },
] as const;
export function validateBallot(newMembers: unknown, media: unknown) {
  for (const [index, value] of [newMembers, media].entries()) {
    if (typeof value !== "string" || (value !== ABSTAIN && !ROLES[index].candidates.some(c => c.id === value))) throw new Error(`Choose one option for ${ROLES[index].title}, or select abstain.`);
  }
  if (newMembers === ABSTAIN && media === ABSTAIN) throw new Error("Choose a candidate for at least one role.");
  return { newMembers: newMembers as string, media: media as string };
}
