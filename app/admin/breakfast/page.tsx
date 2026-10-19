import Link from "next/link";
import { prisma } from "@/app/lib";
import { requireBreakfastAdmin } from "./auth";
import BreakfastForm from "./BreakfastForm";
import DrawStage from "./DrawStage";
export const dynamic = "force-dynamic";
export default async function BreakfastPage() {
  await requireBreakfastAdmin();
  const [entries, draw] = await Promise.all([
    prisma.breakfastEntry.findMany({ orderBy: [{ nameKey: "asc" }, { id: "asc" }] }),
    prisma.breakfastDraw.findUnique({ where: { id: "breakfast" } }),
  ]);
  const ready = Boolean(draw), drawn = Boolean(draw?.drawnAt);
  return <main className="breakfastPage">
    <Link href="/admin" className="breakfastBack">← Back to admin</Link>
    <header className="hero"><div><p className="eyebrow">SUPPORTING SPREAD A SMILE</p><h1>Breakfast draw</h1><p>Add everyone who has paid for breakfast, then select three lucky winners.</p></div><div className="raised"><span>Paid guests</span><strong>{entries.length}</strong></div></header>
    {!ready ? <section className="breakfastPanel"><h2>Breakfast draw is being set up</h2><p>Please refresh once the deployment has completed.</p></section> : <>
      <DrawStage names={entries.map(e => e.name)} savedNames={draw?.winnerNames ?? []} drawnAt={draw?.drawnAt?.toISOString() ?? null} entrantCount={draw?.entrantCount ?? entries.length} />
      <div className="breakfastColumns">{!drawn && <section className="breakfastPanel"><h2>Add paid breakfast guests</h2><p>Only add people once their breakfast has been paid for. Enter one name per line to add several at once.</p><BreakfastForm operation="add" label="Add paid names"><label htmlFor="breakfast-names">Name(s)<textarea id="breakfast-names" name="names" required rows={7} maxLength={20200} placeholder={"Craig Reid\nTim Smith"} /></label><p className="muted">One entry per person. If two people share a name, add an initial or other detail to distinguish them.</p></BreakfastForm></section>}
        <section className="breakfastPanel"><h2>Paid guest list · {entries.length}</h2>{!entries.length ? <p>No paid guests added yet.</p> : <ol className="breakfastGuests">{entries.map(entry => <li key={entry.id}><span>{entry.name}{draw?.winnerIds.includes(entry.id) && <strong className="breakfastWinnerBadge">Winner</strong>}</span>{!drawn && <BreakfastForm operation="remove" label="Remove" confirmation={`Remove ${entry.name} from the paid breakfast list?`}><input type="hidden" name="entryId" value={entry.id} /></BreakfastForm>}</li>)}</ol>}</section>
      </div>
    </>}
  </main>;
}
