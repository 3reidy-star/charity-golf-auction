"use client";
import { useActionState } from "react";
import Link from "next/link";
import { closeSquareSales } from "./actions";
type Board = { title: string; closed: boolean };
export default function CloseSquareSales({ boards }: { boards: Board[] }) {
  const [state, action, pending] = useActionState(closeSquareSales, {});
  const allClosed = boards.every(board => board.closed);
  return <section className="squareAdmin" aria-labelledby="square-sales-heading">
    <h2 id="square-sales-heading" style={{marginTop:0}}>Square sales</h2>
    <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:16}}>{boards.map(board => <span key={board.title} style={{padding:"8px 12px",borderRadius:8,fontWeight:700,background:board.closed?"#fcecec":"#e7f4eb",color:board.closed?"#9c2f2f":"#195633"}}>{board.title}: {board.closed ? "CLOSED" : "OPEN"}</span>)}</div>
    <p>Use this on Saturday morning to stop new entries on both the £2 and £10 boards.</p>
    <form action={action} onSubmit={event=>{if(!window.confirm("Close both the £2 and £10 boards to new square purchases? Existing SumUp checkouts can still finish paying."))event.preventDefault();}}>
      <button className="squareAction" disabled={allClosed||pending} style={{background:allClosed?"#657168":"#9c2f2f"}}>{pending?"Closing sales…":allClosed?"Both boards are closed":"Close square sales — both boards"}</button>
      {state.error&&<p role="alert" className="error">{state.error}</p>}
      {state.success&&<p role="status" className="success">{state.success}</p>}
    </form>
    <p className="muted">Existing paid entries are kept. Checkouts already started can still complete. <Link href="/admin/squares">Manage individual boards, payments or reopen sales →</Link></p>
  </section>;
}
