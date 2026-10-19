"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateBreakfast } from "./actions";
type Props = { names: string[]; savedNames: string[]; drawnAt: string | null; entrantCount: number; tv?: boolean };
export default function DrawStage({ names, savedNames, drawnAt, entrantCount, tv = false }: Props) {
  const router = useRouter();
  const stage = useRef<HTMLElement>(null), previousDrawnAt = useRef(drawnAt);
  const [fullScreenError, setFullScreenError] = useState("");
  const [running, setRunning] = useState(false), [tick, setTick] = useState(0), [revealed, setRevealed] = useState(0);
  const [localResult, setLocalResult] = useState<{ names: string[]; drawnAt: string; entrantCount: number } | null>(null);
  const [error, setError] = useState("");
  const inFlight = useRef(false), timers = useRef<ReturnType<typeof setTimeout>[]>([]), mounted = useRef(true);
  const winners = !running && drawnAt ? savedNames : localResult?.names ?? savedNames;
  const resultDate = !running && drawnAt ? drawnAt : localResult?.drawnAt ?? drawnAt;
  const count = !running && drawnAt ? entrantCount : localResult?.entrantCount ?? entrantCount;
  const complete = Boolean(resultDate) && !running;
  const visible = complete ? 1 : revealed;
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; timers.current.forEach(clearTimeout); }; }, []);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setTick(value => value + 1), 80);
    return () => clearInterval(timer);
  }, [running]);
  useEffect(() => {
    if (previousDrawnAt.current && !drawnAt) {
      timers.current.forEach(clearTimeout); timers.current = [];
      setLocalResult(null); setRevealed(0); setRunning(false); setError(""); inFlight.current = false;
    }
    previousDrawnAt.current = drawnAt;
  }, [drawnAt]);
  useEffect(() => {
    if (!tv || running) return;
    const timer = setInterval(() => router.refresh(), 3000);
    return () => clearInterval(timer);
  }, [tv, running, router]);
  async function fullScreen() {
    setFullScreenError("");
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (stage.current?.requestFullscreen) await stage.current.requestFullscreen();
      else setFullScreenError("Use your browser’s full-screen option or cast this TV display to the screen.");
    } catch { setFullScreenError("Use your browser’s full-screen option or cast this TV display to the screen."); }
  }
  async function start() {
    if (inFlight.current || complete || names.length < 1) return;
    if (!window.confirm(`Select one winner from ${names.length} paid guests? The result will be saved and the guest list locked.`)) return;
    inFlight.current = true;
    setError(""); setRevealed(0); setRunning(true);
    try {
      const data = new FormData(); data.set("operation", "draw");
      const result = await updateBreakfast({}, data);
      if (!mounted.current) return;
      if (result.error || !result.winnerNames || !result.drawnAt) throw new Error(result.error ?? "Unable to confirm the result. Refresh to check the saved draw.");
      setLocalResult({ names: result.winnerNames, drawnAt: result.drawnAt, entrantCount: result.entrantCount ?? names.length });
      [2400].forEach((delay, index) => {
        timers.current.push(setTimeout(() => {
          if (!mounted.current) return;
          setRevealed(index + 1);
          if (index === 0) { setRunning(false); inFlight.current = false; }
        }, delay));
      });
    } catch (e) {
      setRunning(false); inFlight.current = false;
      setError(e instanceof Error ? e.message : "Unable to confirm the result. Refresh to check the saved draw.");
      router.refresh();
    }
  }
  if (complete && winners.length > 1) return <section className={`drawStage ${tv ? "tvStage" : ""}`}><p className="drawStageEyebrow">PREVIOUS TEST RESULT</p><h2>Ready for a single-winner draw</h2><p className="drawStageIntro">The previous draw selected multiple winners: {winners.join(", ")}. Reset that result before drawing one winner.</p><Link className="breakfastTVLink" href="/admin/breakfast">Manage names and reset previous draw</Link></section>;
  return <section ref={stage} className={`drawStage ${tv ? "tvStage" : ""} ${running ? "isRunning" : ""} ${complete ? "isComplete" : ""}`} aria-busy={running}>
    {tv && <nav className="tvControls" aria-label="TV display controls"><Link href="/admin/breakfast">← Manage names</Link><button type="button" onClick={fullScreen}>⛶ Toggle full screen</button></nav>}
    {fullScreenError && <p className="tvFullScreenHint" role="status">{fullScreenError}</p>}
    <div className="drawStageGlow" aria-hidden="true" />
    <p className="drawStageEyebrow">SPREAD A SMILE · BREAKFAST DRAW</p>
    <h2>{complete ? "Our lucky winner!" : running ? "Here comes the winner…" : "Who will be our lucky winner?"}</h2>
    <p className="drawStageIntro">{complete ? "Congratulations — and thank you for supporting Spread a Smile." : "One entry per paid guest. One lucky winner. Let’s make someone’s day."}</p>
    <div className="drawReels" aria-hidden="true">{[0].map(index => {
      const won = index < visible;
      const rollingName = names.length ? names[(tick * (index + 3) + index * 7) % names.length] : "Your name here";
      return <article key={index} className={`drawReel ${won ? "isWinner" : running ? "isSpinning" : ""}`}>
        <span className="drawReelLabel">WINNER</span>
        <span className="drawMedal">{won ? "★" : "?"}</span>
        <div className="drawNameWindow"><strong style={tv ? { fontSize: `clamp(24px, ${Math.min(4.4, Math.max(1.5, 100 / Math.max(1, (won ? winners[index] ?? "" : running ? rollingName : "Ready to win").length)))}vw, 100px)` } : undefined} className={running && !won ? "drawRollingName" : ""}>{won ? winners[index] : running ? rollingName : "Ready to win"}</strong></div>
        <span className="drawReelFoot">{won ? "CONGRATULATIONS!" : running ? "Selecting…" : "GOOD LUCK!"}</span>
      </article>;
    })}</div>
    <p className="drawAnnouncement" role="status" aria-live="polite" aria-atomic="true">{running ? visible ? `Winner ${visible}: ${winners[visible - 1]}.` : "Selecting one winner. Good luck!" : complete ? `The winner is ${winners[0]}.` : `${names.length} paid guests entered.`}</p>
    {complete ? <div className="drawSaved"><span>✓ Result saved</span><p>Selected from {count} paid guests on {new Date(resultDate!).toLocaleString("en-GB", { timeZone: "Europe/London", dateStyle: "medium", timeStyle: "short" })}. Refreshing keeps the same winners.</p></div> : <>
      <button type="button" onClick={start} disabled={running || names.length < 1} className="drawStartButton">{running ? "Drawing the winner…" : "✦ Draw 1 winner"}</button>
      <p className="drawStageNote">{names.length < 1 ? "Add at least one paid guest to start." : running ? "The result is being saved and revealed. Please keep this screen open." : `${names.length} guests entered · Check the list first — the result will be saved.`}</p>
    </>}
    {error && <p role="alert" className="drawError">{error}</p>}
    <p className="drawFairness">Each guest has the same chance. The server selects and saves the winner; the animation reveals the result.</p>
  </section>;
}
