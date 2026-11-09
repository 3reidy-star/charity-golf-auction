"use client";
import { useActionState } from "react";
import { setCommitteeVoting } from "./actions";
export default function VotingControls({ open, ready }: { open: boolean; ready: boolean }) {
  const [state, action, pending] = useActionState(setCommitteeVoting, {});
  return <form action={action} className="voteAdminControls"><input type="hidden" name="operation" value={open ? "close" : "open"} /><button className="squareAction" disabled={pending || !ready} style={{background:open?"#9c2f2f":undefined}}>{pending ? "Saving…" : open ? "Close voting" : "Open voting"}</button>{state.error && <p className="error" role="alert">{state.error}</p>}{state.success && <p className="success" role="status">{state.success}</p>}</form>;
}
