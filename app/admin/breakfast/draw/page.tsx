import Link from "next/link";
import { prisma } from "@/app/lib";
import { requireBreakfastAdmin } from "../auth";
import DrawStage from "../DrawStage";
export const dynamic = "force-dynamic";
export default async function FullScreenBreakfastDraw() {
  await requireBreakfastAdmin();
  const [entries, draw] = await Promise.all([
    prisma.breakfastEntry.findMany({ where: { receiptReceived: true }, orderBy: [{ nameKey: "asc" }, { id: "asc" }] }),
    prisma.breakfastDraw.findUnique({ where: { id: "breakfast" } }),
  ]);
  if (!draw) return <main className="breakfastPage"><Link href="/admin/breakfast">← Manage names</Link><section className="breakfastPanel"><h1>Breakfast draw is being set up</h1><p>Please refresh once deployment has completed.</p></section></main>;
  return <main className="breakfastPage isTV"><DrawStage tv names={entries.map(e => e.name)} savedNames={draw.winnerNames} drawnAt={draw.drawnAt?.toISOString() ?? null} entrantCount={draw.entrantCount ?? entries.length} /></main>;
}
