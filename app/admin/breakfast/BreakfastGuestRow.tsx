"use client";
import { useState, useTransition } from "react";
import { updateBreakfast } from "./actions";
import BreakfastForm from "./BreakfastForm";
import { changeBreakfastStatus, isEligibleForBreakfastDraw, type BreakfastStatus } from "@/app/breakfast/eligibility";
type Entry = BreakfastStatus & { id: string; name: string };
export default function BreakfastGuestRow({ entry, locked, winner }: { entry: Entry; locked: boolean; winner: boolean }) {
  const [optimistic, setOptimistic] = useState<BreakfastStatus | null>(null);
  const [pending, startTransition] = useTransition(), [error, setError] = useState("");
  const status = optimistic ?? entry;
  const eligible = isEligibleForBreakfastDraw(status);
  function change(field: string, checked: boolean) {
    if (pending || locked) return;
    let next: BreakfastStatus;
    try { next = changeBreakfastStatus(status, field, checked); } catch (e) { setError(e instanceof Error ? e.message : "Unable to change status."); return; }
    setError(""); setOptimistic(next);
    startTransition(async () => {
      try {
        const data = new FormData(); data.set("operation", "set-status"); data.set("entryId", entry.id); data.set("field", field); data.set("checked", String(checked));
        const result = await updateBreakfast({}, data);
        if (result.error) setError(result.error);
      } catch { setError("Unable to save. Refresh the page to check the saved checklist."); }
      finally { setOptimistic(null); }
    });
  }
  return <tr className={eligible ? "breakfastEligibleRow" : ""}>
    <td className="breakfastGuestName"><strong>{entry.name}</strong>{winner && <span className="breakfastWinnerBadge">Winner</span>}{pending && <span className="breakfastSaving" role="status">Saving…</span>}{error && <p role="alert" className="error">{error}</p>}</td>
    <td><label className="breakfastCheck"><input type="checkbox" checked={status.paidOwnBreakfast} onChange={e => change("paidOwnBreakfast", e.target.checked)} disabled={locked || pending} aria-label={`${entry.name}: paid for own breakfast`} /><span>Paid own breakfast</span></label></td>
    <td><label className="breakfastCheck"><input type="checkbox" checked={status.receiptReceived} onChange={e => change("receiptReceived", e.target.checked)} disabled={locked || pending || !status.paidOwnBreakfast} aria-label={`${entry.name}: receipt received`} /><span>Receipt received</span></label></td>
    <td><span className={`breakfastEligibility ${eligible ? "isEligible" : ""}`}>{eligible ? "✓ In the draw" : status.paidOwnBreakfast ? "Awaiting receipt" : "Not entered"}</span></td>
    {!locked && <td><BreakfastForm operation="remove" label="Remove" disabled={pending} confirmation={`Remove ${entry.name} from the breakfast guest list?`}><input type="hidden" name="entryId" value={entry.id} /></BreakfastForm></td>}
  </tr>;
}
