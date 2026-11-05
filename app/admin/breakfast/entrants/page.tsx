import { prisma } from "@/app/lib";
import { requireBreakfastAdmin } from "../auth";
import EntrantsScreen from "./EntrantsScreen";
export const dynamic = "force-dynamic";
export default async function BreakfastEntrantsPage() {
  await requireBreakfastAdmin();
  const entries = await prisma.breakfastEntry.findMany({ where: { receiptReceived: true }, select: { name: true }, orderBy: [{ nameKey: "asc" }, { id: "asc" }] });
  return <main className="breakfastPage isTV"><EntrantsScreen names={entries.map(entry => entry.name)} /></main>;
}
