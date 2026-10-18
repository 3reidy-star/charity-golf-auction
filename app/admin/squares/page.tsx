import { cookies } from "next/headers";
import { createHash } from "crypto";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/app/lib";
import { BOARDS, CODES } from "@/app/squares/config";
import { paymentReady } from "@/app/squares/lib/sumup";
import { checkPayment, updateBoard } from "./actions";
export const dynamic="force-dynamic";
export default async function SquaresAdmin({searchParams}:{searchParams:Promise<{error?:string}>}){
 if(!process.env.ADMIN_PASSWORD||(await cookies()).get("auction_admin")?.value!==createHash("sha256").update(process.env.ADMIN_PASSWORD).digest("hex"))redirect("/admin");
 const [settings,orders,params]=await Promise.all([prisma.squareBoard.findMany(),prisma.squarePurchase.findMany({orderBy:{createdAt:"desc"}}),searchParams]);
 return <main><Link href="/admin">← Auction admin</Link><h1>Drive-In boards</h1><p><Link href="/squares">View public boards</Link></p><p>SumUp: <strong>{paymentReady()?"Configured — complete a payment test before opening":"Not connected"}</strong></p>{params.error&&<p className="error">Unable to verify with SumUp. The reservation has been kept. Please try again.</p>}
 {BOARDS.map(board=>{const setting=settings.find(s=>s.id===board.id),purchases=orders.filter(o=>o.boardId===board.id),paid=purchases.filter(p=>p.status==="PAID"),sold=paid.reduce((n,p)=>n+p.squares.length,0);return <section className="squareAdmin" key={board.id}><h2>{board.title}</h2><p><strong>£{paid.reduce((n,p)=>n+p.amountPence,0)/100} paid</strong> · {sold}/{CODES.length} sold · {purchases.filter(p=>p.status==="PENDING").reduce((n,p)=>n+p.squares.length,0)} reserved</p>
 <form action={updateBoard} className="boardSettings"><input type="hidden" name="boardId" value={board.id}/><label><input type="checkbox" name="closed" defaultChecked={setting?.closed}/> Close new purchases</label><label>Winning square <select name="winningSquare" defaultValue={setting?.winningSquare||""}><option value="">Not announced</option>{CODES.map(code=><option key={code}>{code}</option>)}</select></label><button type="submit" className="squareAction">Save board</button></form><p className="muted">Closing stops new reservations. Existing SumUp checkouts can still complete. Announcing a winner closes the board.</p>
 <div style={{overflowX:"auto"}}><table className="squareOrders"><thead><tr><th>Name</th><th>Squares</th><th>Total</th><th>Status</th><th>Created (UK)</th><th>SumUp checkout</th><th></th></tr></thead><tbody>{purchases.map(p=><tr key={p.id}><td>{p.buyerName}</td><td>{p.squares.join(", ")}</td><td>£{p.amountPence/100}</td><td>{p.status}</td><td>{p.createdAt.toLocaleString("en-GB",{timeZone:"Europe/London"})}</td><td>{p.checkoutId||"Awaiting connection"}</td><td>{p.status==="PENDING"&&<form action={checkPayment}><input type="hidden" name="purchaseId" value={p.id}/><button>Check payment</button></form>}</td></tr>)}</tbody></table>{!purchases.length&&<p>No purchases yet.</p>}</div></section>})}</main>;
}
