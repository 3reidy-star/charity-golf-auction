import { Checkout, verifiedOutcome } from "./sumup";

type Reservation = { id:string; amountPence:number; checkoutId:string|null; createdAt:Date };
type Provider = <T>(path:string,init?:RequestInit)=>Promise<T>;

// Successful DELETE deactivates the checkout at SumUp. Never release the local
// claim merely because a browser abandoned checkout or a provider call failed.
export async function deactivateUnpaidCheckout(order:Reservation, provider:Provider, now=Date.now()) {
  const checkout=order.checkoutId
    ?await provider<Checkout>(`/${encodeURIComponent(order.checkoutId)}`)
    :(await provider<Checkout[]>(`?checkout_reference=${encodeURIComponent(order.id)}`))[0];
  if(!checkout){
    // An in-flight creation request may still finish. Keep its reservation until
    // comfortably beyond the 12-second provider timeout.
    if(now-order.createdAt.getTime()<60000)throw new Error("CREATING");
    return;
  }
  if(verifiedOutcome(checkout,order)==="PAID")throw new Error("PAID");
  if(checkout.status==="EXPIRED")return;
  const cancelled=await provider<Checkout>(`/${encodeURIComponent(checkout.id)}`,{method:"DELETE"});
  if(cancelled.id!==checkout.id)throw new Error("MISMATCH");
  if(verifiedOutcome(cancelled,order)==="PAID")throw new Error("PAID");
}
