"use client";
import { useActionState, type ReactNode } from "react";
import { updateBreakfast } from "./actions";
export default function BreakfastForm({ operation, label, children, disabled = false, confirmation }: { operation: string; label: string; children?: ReactNode; disabled?: boolean; confirmation?: string }) {
  const [state, action, pending] = useActionState(updateBreakfast, {});
  return <form action={action} className="breakfastForm" onSubmit={e => { if (confirmation && !window.confirm(confirmation)) e.preventDefault(); }}>
    <input type="hidden" name="operation" value={operation} />{children}
    {state.error && <p className="error" role="alert">{state.error}</p>}
    {state.success && <p className="success" role="status">{state.success}</p>}
    <button className={operation === "draw" ? "breakfastDrawButton" : "breakfastButton"} disabled={disabled || pending}>{pending ? operation === "draw" ? "Selecting winners…" : "Saving…" : label}</button>
  </form>;
}
