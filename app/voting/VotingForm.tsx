"use client";
import { useActionState, useEffect, useState } from "react";
import { ABSTAIN, ROLES } from "./config";
import { prepareVotingSession, submitCommitteeVote } from "./actions";
export default function VotingForm({ open }: { open: boolean }) {
  const [session, setSession] = useState<{ ready?: boolean; submitted?: boolean; error?: string }>({});
  const [state, action, pending] = useActionState(submitCommitteeVote, {});
  const [choices, setChoices] = useState<Record<string,string>>({});
  useEffect(() => { let active = true; prepareVotingSession().then(result => { if (active) setSession(result); }).catch(() => { if (active) setSession({error:"Unable to prepare voting. Please refresh and try again."}); }); return () => { active = false; }; }, []);
  if (session.submitted || state.submitted) return <section className="voteThanks" role="status"><span aria-hidden="true">✓</span><h2>Thank you — your vote is recorded</h2><p>This browser has submitted its ballot. You do not need to vote again.</p></section>;
  if (!open) return <section className="voteNotice"><h2>Voting is not currently open</h2><p>Please check back when the committee opens voting.</p></section>;
  return <form action={action} className="voteForm">
    <p className="voteInstructions">Select one person for each role, or choose abstain if you have no preference. Your ballot is final once submitted.</p>
    {ROLES.map(role => <fieldset key={role.id} disabled={pending || !session.ready}><legend>{role.title}</legend><div className="voteCandidates">{[...role.candidates, { id: ABSTAIN, name: "Abstain / no preference" }].map(candidate => <label key={candidate.id} className={`voteCandidate ${choices[role.id] === candidate.id ? "selected" : ""}`}><input type="radio" name={role.id} value={candidate.id} required checked={choices[role.id] === candidate.id} onChange={() => setChoices({...choices,[role.id]:candidate.id})} /><span>{candidate.name}</span></label>)}</div></fieldset>)}
    {session.error && <p className="error" role="alert">{session.error}</p>}{state.error && <p className="error" role="alert">{state.error}</p>}
    <div className="voteSubmit"><h2>Check your choices</h2>{ROLES.map(role => <p key={role.id}><strong>{role.title}:</strong> {role.candidates.find(c => c.id === choices[role.id])?.name ?? (choices[role.id] === ABSTAIN ? "Abstain" : "Choose above")}</p>)}<button type="submit" disabled={pending || !session.ready || !choices.newMembers || !choices.media}>{pending ? "Recording your vote…" : !session.ready ? "Preparing voting…" : "Submit my vote"}</button><p className="muted">One ballot per browser. No name, login or member number required.</p></div>
  </form>;
}
