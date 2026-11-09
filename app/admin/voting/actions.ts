"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib";
import { ELECTION_ID } from "@/app/voting/config";
import { requireBreakfastAdmin as requireAdmin } from "../breakfast/auth";
export type VotingAdminState = { error?: string; success?: string };
export async function setCommitteeVoting(_state: VotingAdminState, data: FormData): Promise<VotingAdminState> {
  await requireAdmin();
  const operation = data.get("operation");
  if (operation !== "open" && operation !== "close") return { error: "Choose open or close voting." };
  const open = operation === "open";
  try {
    await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "CommitteeElection" WHERE "id" = ${ELECTION_ID} FOR UPDATE`;
      const current = await tx.committeeElection.findUnique({ where: { id: ELECTION_ID } });
      if (!current) throw new Error("SETUP");
      await tx.committeeElection.update({ where: { id: ELECTION_ID }, data: open ? { open: true, openedAt: current.openedAt ?? new Date(), closedAt: null } : { open: false, closedAt: new Date() } });
    });
  } catch { return { error: "Unable to change voting. Check deployment completed, then refresh and try again." }; }
  revalidatePath("/voting"); revalidatePath("/admin/voting");
  return { success: open ? "Voting is open. People can use the existing squares link or /voting." : "Voting is closed. All recorded ballots have been kept." };
}
