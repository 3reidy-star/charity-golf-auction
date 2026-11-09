import Link from "next/link";
import { prisma } from "@/app/lib";
import { ELECTION_ID } from "./config";
import VotingForm from "./VotingForm";
export const dynamic = "force-dynamic";
export default async function CommitteeVotingPage() {
  const election = await prisma.committeeElection.findUnique({ where: { id: ELECTION_ID }, select: { open: true } });
  return <main className="votingPage"><Link href="/squares" className="breakfastBack">← Back to the squares</Link><header className="hero"><div><p className="eyebrow">THE ESSEX · COMMITTEE ELECTION</p><h1>Have your say</h1><p>Choose who you would like to represent you.</p></div></header><VotingForm open={Boolean(election?.open)} /></main>;
}
