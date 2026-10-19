"use server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/app/lib";
import { validateBreakfastReset } from "@/app/breakfast/reset";
import { parseNames, selectThree } from "@/app/breakfast/draw";
import { requireBreakfastAdmin } from "./auth";
export type BreakfastState = { error?: string; success?: string; winnerNames?: string[]; drawnAt?: string; entrantCount?: number };
export async function updateBreakfast(_previous: BreakfastState, data: FormData): Promise<BreakfastState> {
  await requireBreakfastAdmin();
  const operation = String(data.get("operation") ?? "");
  let message = "";
  let result: BreakfastState = {};
  try {
    await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "BreakfastDraw" WHERE "id" = 'breakfast' FOR UPDATE`;
      const draw = await tx.breakfastDraw.findUnique({ where: { id: "breakfast" } });
      if (!draw) throw new Error("Breakfast setup is not available yet. Please check the deployment completed.");
      if (operation === "reset-draw" || operation === "clear-breakfast") {
        validateBreakfastReset(data.get("confirmation"), data.get("expectedDrawnAt"), draw.drawnAt);
        if (operation === "clear-breakfast") await tx.breakfastEntry.deleteMany();
        await tx.breakfastDraw.update({ where: { id: "breakfast" }, data: { winnerIds: [], winnerNames: [], drawnAt: null, entrantCount: null } });
        message = operation === "clear-breakfast" ? "Breakfast names and test winners cleared. Ready for a fresh event." : "Winners cleared. The paid guest list has been kept and unlocked.";
        return;
      }
      if (draw.drawnAt) {
        if (operation === "draw") {
          result = { winnerNames: draw.winnerNames, drawnAt: draw.drawnAt.toISOString(), entrantCount: draw.entrantCount ?? 0 };
          message = "The saved winners are shown below.";
          return;
        }
        throw new Error("The winners have already been drawn. Reset the breakfast draw before editing the list.");
      }
      if (operation === "add") {
        const entries = parseNames(String(data.get("names") ?? ""));
        const existing = await tx.breakfastEntry.findFirst({ where: { nameKey: { in: entries.map(e => e.nameKey) } } });
        if (existing) throw new Error(`${existing.name} is already on the paid list. Each person gets one entry; use an initial to distinguish people with the same name.`);
        await tx.breakfastEntry.createMany({ data: entries });
        message = `${entries.length === 1 ? entries[0].name + " added" : entries.length + " names added"} to the paid breakfast list.`;
      } else if (operation === "remove") {
        const id = String(data.get("entryId") ?? "");
        const removed = await tx.breakfastEntry.deleteMany({ where: { id } });
        if (!removed.count) throw new Error("This name has already been removed. Refresh the list.");
        message = "Name removed from the paid list.";
      } else if (operation === "draw") {
        const entries = await tx.breakfastEntry.findMany({ orderBy: { id: "asc" } });
        const winners = selectThree(entries);
        const saved = await tx.breakfastDraw.update({ where: { id: "breakfast" }, data: { winnerIds: winners.map(e => e.id), winnerNames: winners.map(e => e.name), entrantCount: entries.length, drawnAt: new Date() } });
        result = { winnerNames: saved.winnerNames, drawnAt: saved.drawnAt!.toISOString(), entrantCount: saved.entrantCount ?? entries.length };
        message = "Three winners have been selected and saved.";
      } else throw new Error("Unknown breakfast action.");
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) return { error: "Unable to save. Refresh the page and try again." };
    return { error: error instanceof Error ? error.message : "Unable to save. Please try again." };
  }
  revalidatePath("/admin/breakfast");
  return { success: message, ...result };
}
