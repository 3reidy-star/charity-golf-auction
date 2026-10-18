export type Checkout = {
  id: string; checkout_reference: string; amount: number; currency: string;
  merchant_code: string; status: string; hosted_checkout_url?: string;
};
export function paymentReady() {
  return !!(process.env.SUMUP_API_KEY && process.env.SUMUP_MERCHANT_CODE && process.env.APP_URL);
}
export async function sumup<T>(path: string, init?: RequestInit): Promise<T> {
  if (!paymentReady()) throw new Error("SumUp is not connected yet.");
  const response = await fetch(`https://api.sumup.com/v0.1/checkouts${path}`, {
    ...init, cache: "no-store", signal: AbortSignal.timeout(12000),
    headers: { Authorization: `Bearer ${process.env.SUMUP_API_KEY}`, "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error(`SumUp request failed (${response.status}).`);
  return await response.json() as T;
}
export function verifiedOutcome(checkout: Checkout, order: {id: string; amountPence: number}) {
  if (checkout.checkout_reference !== order.id || checkout.currency !== "GBP" ||
      Math.round(checkout.amount * 100) !== order.amountPence ||
      checkout.merchant_code !== process.env.SUMUP_MERCHANT_CODE) throw new Error("Payment details do not match the reservation.");
  if (checkout.status === "PAID") return "PAID";
  // FAILED may allow another attempt: retain the claim until EXPIRED.
  if (checkout.status === "EXPIRED") return "EXPIRED";
  return "PENDING";
}
export function checkoutUrl(checkout: Checkout) {
  const url = new URL(checkout.hosted_checkout_url || "https://invalid.invalid");
  if (url.protocol !== "https:" || url.hostname !== "checkout.sumup.com") throw new Error("SumUp did not return a payment link.");
  return url.toString();
}
