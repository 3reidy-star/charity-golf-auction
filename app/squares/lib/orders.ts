import { prisma } from "@/app/lib";
import { Checkout, sumup, verifiedOutcome } from "./sumup";

export async function reconcilePurchase(id: string) {
  const order = await prisma.squarePurchase.findUnique({ where: { id } });
  if (!order || order.status !== "PENDING") return order;
  // Recover a checkout if creation succeeded but the response/storage failed.
  const checkout = order.checkoutId
    ? await sumup<Checkout>(`/${encodeURIComponent(order.checkoutId)}`)
    : (await sumup<Checkout[]>(`?checkout_reference=${encodeURIComponent(order.id)}`))[0];
  if (!checkout) {
    // No payment exists. Wait well beyond the creation request timeout before releasing.
    if (order.expiresAt.getTime() < Date.now()) await settle(order.id, "EXPIRED");
  } else {
    const status = verifiedOutcome(checkout, order);
    await prisma.squarePurchase.updateMany({ where: { id, status: "PENDING" }, data: {
      checkoutId: checkout.id, checkoutUrl: checkout.hosted_checkout_url,
    } });
    await settle(id, status);
  }
  return prisma.squarePurchase.findUnique({ where: { id } });
}
async function settle(id: string, status: string) {
  if (status === "PENDING") return;
  await prisma.$transaction(async tx => {
    const changed = await tx.squarePurchase.updateMany({ where: { id, status: "PENDING" }, data: {
      status, ...(status === "PAID" ? { paidAt: new Date() } : {}),
    } });
    if (changed.count && status === "EXPIRED") await tx.squareClaim.deleteMany({ where: { purchaseId: id } });
  });
}
export async function reconcileExpired(boardId: string) {
  const orders = await prisma.squarePurchase.findMany({ where: { boardId, status: "PENDING", expiresAt: { lt: new Date() } }, select: { id: true }, take: 12 });
  await Promise.allSettled(orders.map(order => reconcilePurchase(order.id)));
}
