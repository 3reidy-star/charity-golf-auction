"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function GoToDraw({ eligibleCount, drawn }: { eligibleCount: number; drawn: boolean }) {
  const router = useRouter();
  const [opening, setOpening] = useState(false);
  async function open() {
    if (opening || (!drawn && !eligibleCount)) return;
    setOpening(true);
    // Request from this click, using the document element so fullscreen survives navigation.
    try { if (!document.fullscreenElement && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); }
    catch { /* The draw page still fills the viewport when the browser refuses fullscreen. */ }
    router.push(drawn ? "/admin/breakfast/draw" : "/admin/breakfast/entrants");
  }
  return <section className="breakfastPanel breakfastContinue"><div><h2>{drawn ? "View the saved winner" : "Ready to review the entrants?"}</h2><p>{drawn ? "Open the saved result on its own full-screen page." : `${eligibleCount} eligible ${eligibleCount === 1 ? "guest" : "guests"}. Only guests whose receipt has been received will be included.`}</p>{!drawn && !eligibleCount && <p className="muted">Tick Receipt received for at least one guest first.</p>}</div><button type="button" className="breakfastTVLink" onClick={open} disabled={opening || (!drawn && !eligibleCount)}>{opening ? "Opening screen…" : drawn ? "View winner full screen →" : "View entrants full screen →"}</button></section>;
}
