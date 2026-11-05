import Link from "next/link";
import { prisma } from "@/app/lib";
import { requireBreakfastAdmin } from "./auth";
import BreakfastForm from "./BreakfastForm";
import GoToDraw from "./GoToDraw";
import { redirect } from "next/navigation";
import BreakfastGuestRow from "./BreakfastGuestRow";
import { isEligibleForBreakfastDraw } from "@/app/breakfast/eligibility";
export const dynamic = "force-dynamic";
export default async function BreakfastPage({ searchParams }: { searchParams: Promise<{ tv?: string }> }) {
  await requireBreakfastAdmin();
  if ((await searchParams).tv === "1") redirect("/admin/breakfast/draw");
  const [entries, draw] = await Promise.all([
    prisma.breakfastEntry.findMany({ orderBy: [{ nameKey: "asc" }, { id: "asc" }] }),
    prisma.breakfastDraw.findUnique({ where: { id: "breakfast" } }),
  ]);
  const ready = Boolean(draw), drawn = Boolean(draw?.drawnAt);
  const eligible = entries.filter(isEligibleForBreakfastDraw);
  return <main className="breakfastPage">
    <div className="breakfastToolbar"><Link href="/admin" className="breakfastBack">← Back to admin</Link></div>
    <header className="hero"><div><p className="eyebrow">SUPPORTING SPREAD A SMILE</p><h1>Breakfast guest list</h1><p>Enter the guest names, then tick Receipt received when they hand it in. This confirms they paid for breakfast and enters them into the draw.</p></div><div className="raised"><span>Entered in the draw</span><strong>{eligible.length}</strong></div></header>
    {!ready ? <section className="breakfastPanel"><h2>Breakfast draw is being set up</h2><p>Please refresh once the deployment has completed.</p></section> : <>
      <div className="breakfastChecklistStats"><span><strong>{entries.length}</strong> guests listed</span><span><strong>{eligible.length}</strong> receipts received / in the draw</span></div>
      <div className="breakfastColumns">{!drawn && <section className="breakfastPanel"><h2>Add breakfast guests</h2><p>Enter everyone’s name now, one per line. Tick them off as they hand in their receipt.</p><BreakfastForm operation="add" label="Add names"><label htmlFor="breakfast-names">Name(s)<textarea id="breakfast-names" name="names" required rows={7} maxLength={20200} placeholder={"Craig Reid\nTim Smith"} /></label><p className="muted">One entry per person. If two people share a name, add an initial or other detail to distinguish them.</p></BreakfastForm></section>}

      </div>
      <section className="breakfastPanel"><h2>Breakfast checklist · {entries.length} guests</h2><p>Tick <strong>Receipt received</strong> when they hand it in. The receipt confirms payment and automatically enters that guest into the draw. Ticks save automatically; untick it to remove them from the draw.</p><p className="muted">You can add names in advance. They stay out of the draw until you receive their receipt.</p>
        {!entries.length ? <p>No guests added yet.</p> : <div className="breakfastChecklistScroll"><table className="breakfastChecklist"><thead><tr><th>Name</th><th>Receipt received</th><th>Draw entry</th>{!drawn && <th>Actions</th>}</tr></thead><tbody>{entries.map(entry => <BreakfastGuestRow key={entry.id} entry={{id:entry.id,name:entry.name,receiptReceived:entry.receiptReceived}} locked={drawn} winner={draw?.winnerIds.includes(entry.id) ?? false} />)}</tbody></table></div>}
      </section>
      <GoToDraw eligibleCount={eligible.length} drawn={drawn} />
      <details className="breakfastPanel breakfastReset"><summary>Reset breakfast draw / clear test run</summary><p>Use this after testing or to start a fresh breakfast event. Type <strong>RESET</strong> to confirm your choice.</p><div className="breakfastResetOptions">
        <section><h3>Reset winners only</h3><p>Keep all names and their receipt ticks, and unlock the draw.</p><BreakfastForm operation="reset-draw" label="Clear winners, keep names" confirmation="Clear the saved breakfast winners and unlock the existing guest list?"><input type="hidden" name="expectedDrawnAt" value={draw?.drawnAt?.toISOString() ?? ""} /><label>Type RESET<input name="confirmation" required pattern="RESET" autoComplete="off" /></label></BreakfastForm></section>
        <section><h3>Clear all breakfast test data</h3><p>Delete all breakfast names and winners, ready to start again.</p><BreakfastForm operation="clear-breakfast" label="Clear breakfast names & winners" confirmation="Delete ALL breakfast guest names and saved winners? This cannot be undone."><input type="hidden" name="expectedDrawnAt" value={draw?.drawnAt?.toISOString() ?? ""} /><label>Type RESET<input name="confirmation" required pattern="RESET" autoComplete="off" /></label></BreakfastForm></section>
      </div></details>
    </>}
  </main>;
}
