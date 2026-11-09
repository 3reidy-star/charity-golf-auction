import Link from "next/link";
import { prisma } from "@/app/lib";
import { ABSTAIN, ELECTION_ID, ROLES } from "@/app/voting/config";
import { requireBreakfastAdmin as requireAdmin } from "../breakfast/auth";
import VotingControls from "./VotingControls";
export const dynamic = "force-dynamic";
export default async function CommitteeVotingAdmin() {
  await requireAdmin();
  const where = { electionId: ELECTION_ID };
  const [election, total, members, media] = await Promise.all([
    prisma.committeeElection.findUnique({ where: { id: ELECTION_ID } }),
    prisma.committeeBallot.count({ where }),
    prisma.committeeBallot.groupBy({ by:["newMembers"], where, _count:{_all:true} }),
    prisma.committeeBallot.groupBy({ by:["media"], where, _count:{_all:true} }),
  ]);
  const counts = [new Map(members.map(r=>[r.newMembers,r._count._all])),new Map(media.map(r=>[r.media,r._count._all]))];
  return <main className="votingPage"><Link href="/admin" className="breakfastBack">← Admin</Link><header className="hero"><div><p className="eyebrow">THE ESSEX · COMMITTEE ELECTION</p><h1>Committee voting</h1><p>Status: <strong>{election?.open ? "OPEN" : election?.openedAt ? "CLOSED" : "NOT OPENED"}</strong> · <strong>{total}</strong> ballots recorded</p></div></header>
    <section className="voteNotice"><h2>{election?.open ? "Voting is open" : election?.openedAt ? "Voting is closed" : "Open voting when you are ready"}</h2><p>The voting button is at the top of the squares page, so the existing pinned WhatsApp link still works. <Link href="/voting">Preview voting page →</Link></p><VotingControls open={Boolean(election?.open)} ready={Boolean(election)} />{election?.openedAt && <p className="muted">First opened: {election.openedAt.toLocaleString("en-GB",{timeZone:"Europe/London"})}{election.closedAt && <> · Closed: {election.closedAt.toLocaleString("en-GB",{timeZone:"Europe/London"})}</>}</p>}<p className="muted">One ballot per browser. Different browsers/devices or cleared cookies can allow another ballot. Results below are admin-only.</p></section>
    <div className="voteResults">{ROLES.map((role,index)=><section key={role.id} className="voteNotice"><h2>{role.title}</h2>{role.candidates.map(candidate=>{const votes=counts[index].get(candidate.id)??0;return <div className="voteResult" key={candidate.id}><div><strong>{candidate.name}</strong><span>{votes} {votes===1?"vote":"votes"}</span></div><div className="voteResultTrack"><div style={{width:`${total?votes/total*100:0}%`}} /></div></div>;})}<p className="muted">Abstained: {counts[index].get(ABSTAIN)??0}</p></section>)}</div>
  </main>;
}
