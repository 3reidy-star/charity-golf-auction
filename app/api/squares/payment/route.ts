import { NextResponse } from "next/server";
import { reconcilePurchase } from "@/app/squares/lib/orders";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^[a-f0-9-]{36}$/i.test(id)) return NextResponse.json({ error: "Reservation not found." }, { status: 404 });
  try {
    const order = await reconcilePurchase(id);
    if (!order) return NextResponse.json({ error: "Reservation not found." }, { status: 404 });
    return NextResponse.json({ id: order.id, boardId: order.boardId, squares: order.squares, status: order.status, amountPence: order.amountPence, checkoutUrl: order.checkoutUrl, expiresAt: order.expiresAt }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Payment verification is temporarily unavailable. Your squares remain reserved. Please check again." }, { status: 503 }); }
}
