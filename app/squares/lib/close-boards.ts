import type { Prisma } from "@prisma/client";
import { BOARDS } from "../config";

export async function closeSquareBoards(tx: Pick<Prisma.TransactionClient, "$executeRaw" | "squareBoard">) {
  // Use the same per-board lock as checkout creation, in a consistent order.
  // Existing claims, purchases and winning squares are left intact.
  for (const board of [...BOARDS].sort((a, b) => a.id.localeCompare(b.id))) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${board.id}))`;
    await tx.squareBoard.upsert({ where: { id: board.id }, create: { id: board.id, closed: true }, update: { closed: true } });
  }
}
