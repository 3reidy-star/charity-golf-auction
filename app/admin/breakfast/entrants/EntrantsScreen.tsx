"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
export default function EntrantsScreen({ names }: { names: string[] }) {
  const router = useRouter();
  const viewport = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false), [opening, setOpening] = useState(false), [hint, setHint] = useState("");
  useEffect(() => { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true); }, []);
  useEffect(() => {
    const timer = setInterval(() => router.refresh(), 3000);
    return () => clearInterval(timer);
  }, [router]);
  useEffect(() => {
    if (paused) return;
    let frame = 0, last = 0, waitUntil = 0, position = viewport.current?.scrollTop ?? 0;
    function scroll(now: number) {
      const list = viewport.current;
      if (!list) return;
      const elapsed = last ? Math.min(now - last, 100) : 0;
      last = now;
      const end = list.scrollHeight - list.clientHeight;
      if (end > 1) {
        if (list.scrollTop >= end - 1) {
          if (!waitUntil) waitUntil = now + 3000;
          if (now >= waitUntil) { position = 0; list.scrollTop = 0; waitUntil = now + 2000; }
        } else if (now >= waitUntil) {
          waitUntil = 0;
          if (Math.abs(list.scrollTop - position) > 2) position = list.scrollTop;
          position = Math.min(end, position + elapsed * Math.max(24, list.clientHeight / 18) / 1000);
          list.scrollTop = position;
        }
      }
      frame = requestAnimationFrame(scroll);
    }
    frame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(frame);
  }, [paused, names.length]);
  async function fullscreen() {
    setHint("");
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else setHint("Use your browser’s full-screen option to display this page on the TV.");
    } catch { setHint("Use your browser’s full-screen option to display this page on the TV."); }
  }
  async function continueToDraw() {
    if (opening || !names.length) return;
    setOpening(true);
    try { if (!document.fullscreenElement && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); }
    catch { /* Keep the screen-filling layout if fullscreen is unavailable. */ }
    router.push("/admin/breakfast/draw");
  }
  return <section className="drawStage entrantsStage">
    <nav className="tvControls" aria-label="Entrants screen controls"><Link href="/admin/breakfast">← Manage names</Link><button type="button" onClick={fullscreen}>⛶ Toggle full screen</button></nav>
    <header className="entrantsHeading"><p className="drawStageEyebrow">SPREAD A SMILE · BREAKFAST DRAW</p><h1>Meet the entrants</h1><p><strong>{names.length}</strong> {names.length === 1 ? "name" : "names"} in the draw · Receipt received for everyone below</p>{hint && <p role="status">{hint}</p>}</header>
    <div ref={viewport} className="entrantsViewport" tabIndex={0} role="region" aria-label="Eligible entrants; names scroll automatically, or use the pause button and scroll manually">
      {names.length ? <ol className="entrantsNames">{names.map((name, index) => <li key={name}><span className="entrantNumber">{String(index + 1).padStart(2, "0")}</span><strong>{name}</strong></li>)}</ol> : <p className="entrantsEmpty">No entrants yet. Return to the guest list and tick Receipt received.</p>}
    </div>
    <footer className="entrantsFooter"><button type="button" className="entrantsPause" onClick={() => setPaused(value => !value)} aria-pressed={paused}>{paused ? "▶ Resume scrolling" : "Ⅱ Pause scrolling"}</button><button type="button" className="drawStartButton" onClick={continueToDraw} disabled={!names.length || opening}>{opening ? "Opening draw…" : "Continue to draw →"}</button><p>The winner will be selected on the next screen.</p></footer>
  </section>;
}
