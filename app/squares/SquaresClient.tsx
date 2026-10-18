"use client";
import { useCallback, useEffect, useState } from "react";
import { CODES } from "./config";
type Board = {id:string; title:string; pricePence:number; closed:boolean; winningSquare:string|null; claims:{code:string;status:string;name:string|null}[]};
type Payment = {id:string;boardId:string;squares:string[];status:string;amountPence:number;checkoutUrl:string|null;expiresAt:string};
const pounds = (pence:number) => `£${(pence/100).toLocaleString("en-GB")}`;
export default function SquaresClient() {
  const [boards,setBoards]=useState<Board[]>([]), [ready,setReady]=useState(false), [boardError,setBoardError]=useState(""), [boardId,setBoardId]=useState("two-pound");
  const [selected,setSelected]=useState<string[]>([]), [name,setName]=useState(""), [error,setError]=useState(""), [busy,setBusy]=useState(false);
  const [purchaseId,setPurchaseId]=useState<string|null>(null), [payment,setPayment]=useState<Payment|null>(null), [paymentError,setPaymentError]=useState("");
  const load=useCallback(async()=>{
    try {const r=await fetch("/api/squares",{cache:"no-store"});const data=await r.json();if(!r.ok)throw new Error(data.error);setBoards(data.boards);setReady(data.ready);setBoardError("");}
    catch(e){setBoardError(e instanceof Error?e.message:"Unable to load boards.");}
  },[]);
  useEffect(()=>{load();const timer=setInterval(load,15000);const stored=new URLSearchParams(window.location.search).get("purchase")||localStorage.getItem("drive-in-purchase");if(stored)setPurchaseId(stored);return()=>clearInterval(timer);},[load]);
  useEffect(()=>{
    if(!purchaseId)return;
    let active=true;
    const check=async()=>{try{const r=await fetch(`/api/squares/payment?id=${encodeURIComponent(purchaseId)}`);const data=await r.json();if(!r.ok)throw new Error(data.error);if(active){setPayment(data);setPaymentError("");if(data.status==="PAID"||data.status==="EXPIRED"||data.status==="CANCELLED")load();}}catch(e){if(active)setPaymentError(e instanceof Error?e.message:"Unable to verify payment.");}};
    check();const timer=setInterval(check,10000);return()=>{active=false;clearInterval(timer);};
  },[purchaseId,load]);
  const board=boards.find(b=>b.id===boardId);
  const taken=new Map(board?.claims.map(c=>[c.code,c]));
  const availableSelected=selected.filter(c=>!taken.has(c));
  async function checkout(e:React.FormEvent){
    e.preventDefault();if(!board)return;setBusy(true);setError("");
    try{const r=await fetch("/api/squares/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({boardId,squares:availableSelected,buyerName:name})});const data=await r.json();
      if(data.purchaseId){localStorage.setItem("drive-in-purchase",data.purchaseId);setPurchaseId(data.purchaseId);setSelected([]);}
      if(!r.ok)throw new Error(data.error);window.location.assign(data.url);
    }catch(e){setError(e instanceof Error?e.message:"Unable to start payment.");load();}finally{setBusy(false);}
  }
  const paid=board?.claims.filter(c=>c.status==="PAID").length??0;
  return <section className="squaresContent">
    <div className="boardTabs" aria-label="Choose a board">{boards.map(b=><button key={b.id} type="button" aria-pressed={boardId===b.id} className={boardId===b.id?"active":""} onClick={()=>{setBoardId(b.id);setSelected([]);setError("");}}><strong>{b.title}</strong><span>{pounds(b.pricePence)} per square</span></button>)}</div>
    {purchaseId&&<section className="paymentNotice" aria-live="polite"><h2>{payment?.status==="PAID"?"Thank you — your squares are confirmed!":payment?.status==="CANCELLED"?"Your reservation was cancelled":payment?.status==="EXPIRED"?"Your reservation has expired":"Your reservation"}</h2>
      {payment&&<><p>{boards.find(b=>b.id===payment.boardId)?.title} · {payment.squares.join(", ")} · {pounds(payment.amountPence)}</p><p>{payment.status==="PAID"?"Payment confirmed by SumUp.":payment.status==="CANCELLED"?"An administrator cleared this unpaid reservation. You can choose available squares again.":payment.status==="EXPIRED"?"No payment was confirmed. You can choose available squares again.":"Awaiting payment confirmation. Your squares remain reserved until SumUp confirms the outcome."}</p>{payment.status==="PENDING"&&payment.checkoutUrl&&new Date(payment.expiresAt).getTime()>Date.now()&&<a className="squareAction" href={payment.checkoutUrl}>Continue to SumUp</a>}</>}
      {paymentError&&<p className="error">{paymentError}</p>}
      <button type="button" className="textButton" onClick={()=>{localStorage.removeItem("drive-in-purchase");setPurchaseId(null);setPayment(null);window.history.replaceState(null,"","/squares");}}>Dismiss</button>
    </section>}
    {boardError&&<p role="alert" className="error">{boardError}</p>}
    {error&&<p role="alert" className="error">{error}</p>}
    {!boards.length?<p>Loading boards… <button type="button" onClick={load}>Try again</button></p>:board&&<>
      <div className="boardIntro"><div><h2>{board.title}</h2><p>Select your squares on the hole below. You can buy up to 20 at a time.</p></div><div><strong>{pounds(paid*board.pricePence)} raised</strong><p>{paid} of {CODES.length} squares sold</p></div></div>
      {!ready&&<p className="paymentNotice">The boards are ready to view. Online payments will open once SumUp is connected.</p>}
      {(board.closed||board.winningSquare)&&<p className="paymentNotice">This board is closed.{board.winningSquare&&<> Winning square: <strong>{board.winningSquare}</strong>.</>}</p>}
      <div className="squareLegend"><span>□ Available</span><span>🟨 Selected</span><span>◼ Sold</span><span>▧ Reserved</span></div>
      <p className="muted">On a phone, swipe across the board to see all squares.</p>
      <div className="boardScroll"><div className="holeBoard" role="group" aria-label={`${board.title} squares`}>
        {CODES.map(code=>{const claim=taken.get(code), chosen=availableSelected.includes(code),winner=board.winningSquare===code;
          return <button key={code} type="button" disabled={!!claim||board.closed||!!board.winningSquare||busy} aria-pressed={chosen} aria-label={`${code}${claim?claim.status==="PAID"?` sold to ${claim.name}`:" reserved":chosen?" selected":" available"}`} className={`holeSquare ${claim?claim.status==="PAID"?"sold":"reserved":""} ${chosen?"selected":""} ${winner?"winner":""}`} title={claim?.name||code} onClick={()=>{if(chosen)setSelected(selected.filter(c=>c!==code));else if(availableSelected.length<20)setSelected([...availableSelected,code]);else setError("You can select up to 20 squares at a time.");}}><strong>{code}</strong>{claim?.name&&<span>{claim.name}</span>}{claim&&claim.status!=="PAID"&&<span>Reserved</span>}{winner&&<span>Winner</span>}</button>;
        })}
      </div></div>
      <form className="squareCheckout" onSubmit={checkout}><div><strong>{availableSelected.length?availableSelected.join(", "):"Choose your squares"}</strong><p>{availableSelected.length} selected · <strong>{pounds(availableSelected.length*board.pricePence)}</strong></p></div><label>Your name <input name="buyerName" value={name} maxLength={60} required autoComplete="name" onChange={e=>setName(e.target.value)} placeholder="Name shown on your squares" /></label><button className="squareAction" disabled={busy||!ready||!availableSelected.length||board.closed||!!board.winningSquare}>{busy?"Reserving…":`Pay ${pounds(availableSelected.length*board.pricePence)} with SumUp`}</button><p className="muted">Your name will appear on purchased squares. Payment details are handled securely by SumUp. Reservations last approximately 15 minutes while you pay.</p></form>
    </>}
  </section>;
}
