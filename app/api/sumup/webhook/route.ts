import { NextResponse } from "next/server";
import { prisma } from "@/app/lib";
import { reconcilePurchase } from "@/app/squares/lib/orders";
export async function POST(request: Request) {
  let body;
  try { body = await request.json(); } catch { return new NextResponse(null, { status: 400 }); }
  if (typeof body.id !== "string" || body.id.length > 100) return new NextResponse(null, { status: 400 });
  const order = await prisma.squarePurchase.findUnique({ where: { checkoutId: body.id }, select: { id: true } });
  // Never trust status in a callback. Re-fetch from SumUp using server credentials.
  if (order) {
    try { await reconcilePurchase(order.id); } catch { return new NextResponse(null, { status: 503 }); }
  }
  return NextResponse.json({ received: true });
}
