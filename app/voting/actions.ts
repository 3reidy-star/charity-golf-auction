"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib";
import { ELECTION_ID, validateBallot } from "./config";
import { makeVoterToken, voterHash, VOTER_COOKIE } from "./browser-token";
export type VoteState = { error?: string; submitted?: boolean };
export async function prepareVotingSession(): Promise<{ ready?: boolean; submitted?: boolean; error?: string }> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return { error: "Voting is not available yet." };
  try {
    const jar = await cookies();
    let token = jar.get(VOTER_COOKIE)?.value;
    if (!voterHash(token, secret)) {
      token = makeVoterToken(secret);
      jar.set(VOTER_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
    }
    const hash = voterHash(token, secret)!;
    const ballot = await prisma.committeeBallot.findUnique({ where: { electionId_voterHash: { electionId: ELECTION_ID, voterHash: hash } }, select: { id: true } });
    return { ready: true, submitted: Boolean(ballot) };
  } catch { return { error: "Unable to prepare voting. Please refresh and try again." }; }
}
export async function submitCommitteeVote(_state: VoteState, data: FormData): Promise<VoteState> {
  const hash = voterHash((await cookies()).get(VOTER_COOKIE)?.value, process.env.ADMIN_PASSWORD ?? "");
  if (!hash) return { error: "Please allow cookies and refresh the voting page before submitting." };
  let ballot;
  try { ballot = validateBallot(data.get("newMembers"), data.get("media")); }
  catch (error) { return { error: error instanceof Error ? error.message : "Choose your candidates." }; }
  try {
    await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "CommitteeElection" WHERE "id" = ${ELECTION_ID} FOR UPDATE`;
      const existing = await tx.committeeBallot.findUnique({ where: { electionId_voterHash: { electionId: ELECTION_ID, voterHash: hash } }, select: { id: true } });
      if (existing) return;
      const election = await tx.committeeElection.findUnique({ where: { id: ELECTION_ID } });
      if (!election?.open) throw new Error("Voting is closed. No vote was recorded.");
      await tx.committeeBallot.create({ data: { electionId: ELECTION_ID, voterHash: hash, ...ballot } });
    });
  } catch (error) { return { error: error instanceof Error && error.message.startsWith("Voting is closed") ? error.message : "Unable to record your vote. Refresh to check whether it was saved before trying again." }; }
  revalidatePath("/voting"); revalidatePath("/admin/voting");
  return { submitted: true };
}
