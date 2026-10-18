import { NextResponse } from "next/server";
import { prisma } from "@/app/lib";
import { validateSelection } from "@/app/squares/config";
import { Checkout, checkoutUrl, paymentReady, sumup } from "@/app/squares/lib/sumup";
import { reconcileExpired } from "@/app/squares/lib/orders";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  if (!paymentReady()) return NextResponse.json({ error: "Online payments are not available yet." }, { status: 503 });
  let selection;
  try {
    const body = await request.json();
    selection = validateSelection(body.boardId, body.squares, body.buyerName);
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid selection." }, { status: 400 }); }
  const { board, squares, buyerName, amountPence } = selection;
  await reconcileExpired(board.id);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  let order;
  try {
    order = await prisma.$transaction(async tx => {
      // Serialize purchases and board closure; the unique claim key is a second safeguard.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${board.id}))`;
      const settings = await tx.squareBoard.findUnique({ where: { id: board.id } });
      if (settings?.closed || settings?.winningSquare) throw new Error("This board is closed.");
      const taken = await tx.squareClaim.count({ where: { boardId: board.id, code: { in: squares } } });
      if (taken) throw new Error("Some squares have just been taken. Please choose again.");
      return tx.squarePurchase.create({ data: {
        boardId: board.id, buyerName, squares, amountPence, expiresAt,
        claims: { create: squares.map(code => ({ boardId: board.id, code })) },
      } });
    });
  } catch (error) { return NextResponse.json({ error: error instanceof Error && ["This board is closed.", "Some squares have just been taken. Please choose again."].includes(error.message) ? error.message : "Unable to reserve these squares. Please try again." }, { status: 409 }); }
  try {
    const base = process.env.APP_URL!.replace(/\/$/, "");
    const checkout = await sumup<Checkout>("", { method: "POST", body: JSON.stringify({
      checkout_reference: order.id, amount: amountPence / 100, currency: "GBP",
      merchant_code: process.env.SUMUP_MERCHANT_CODE,
      description: `Captain's Drive-In ${board.title}: ${squares.join(", ")}`,
      hosted_checkout: { enabled: true }, valid_until: expiresAt.toISOString(),
      redirect_url: `${base}/squares?purchase=${order.id}`,
      return_url: `${base}/api/sumup/webhook`,
    }) });
    const url = checkoutUrl(checkout);
    await prisma.squarePurchase.update({ where: { id: order.id }, data: { checkoutId: checkout.id, checkoutUrl: url } });
    return NextResponse.json({ url, purchaseId: order.id });
  } catch {
    // Keep claims until the API verifies the outcome. A timed-out request may still have succeeded.
    return NextResponse.json({ error: "We could not open checkout. Check your reservation below before trying again.", purchaseId: order.id }, { status: 502 });
  }
}
