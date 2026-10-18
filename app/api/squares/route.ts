import { NextResponse } from "next/server";
import { prisma } from "@/app/lib";
import { BOARDS } from "@/app/squares/config";
import { paymentReady } from "@/app/squares/lib/sumup";
import { reconcileExpired } from "@/app/squares/lib/orders";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    if (paymentReady()) await Promise.all(BOARDS.map(board => reconcileExpired(board.id)));
    const [settings, claims] = await Promise.all([
      prisma.squareBoard.findMany(), prisma.squareClaim.findMany({ include: { purchase: { select: { status:true, buyerName:true } } } }),
    ]);
    return NextResponse.json({ ready:paymentReady(), boards:BOARDS.map(board => ({
      ...board, closed:settings.find(s=>s.id===board.id)?.closed ?? false,
      winningSquare:settings.find(s=>s.id===board.id)?.winningSquare ?? null,
      claims:claims.filter(c=>c.boardId===board.id).map(c=>({code:c.code,status:c.purchase.status,name:c.purchase.status==="PAID"?c.purchase.buyerName:null})),
    })) }, { headers:{"Cache-Control":"no-store"} });
  } catch { return NextResponse.json({error:"The boards are temporarily unavailable. Please try again shortly."},{status:503}); }
}
