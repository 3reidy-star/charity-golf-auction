"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateBreakfast } from "./actions";
type Props = { names: string[]; savedNames: string[]; drawnAt: string | null; entrantCount: number };
export default function DrawStage({ names, savedNames, drawnAt, entrantCount }: Props) {
  const router = useRouter();
  const [running, setRunning] = useState(false), [tick, setTick] = useState(0), [revealed, setRevealed] = useState(0);
  const [localResult, setLocalResult] = useState<{ names: string[]; drawnAt: string; entrantCount: number } | null>(null);
  const [error, setError] = useState("");
  const inFlight = useRef(false), timers = useRef<ReturnType<typeof setTimeout>[]>([]), mounted = useRef(true);
  const winners = localResult?.names ?? savedNames;
  const resultDate = localResult?.drawnAt ?? drawnAt;
  const count = localResult?.entrantCount ?? entrantCount;
  const complete = Boolean(resultDate) && !running;
  const visible = complete ? 3 : revealed;
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; timers.current.forEach(clearTimeout); }; }, []);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setTick(value => value + 1), 80);
    return () => clearInterval(timer);
  }, [running]);
  async function start() {
    if (inFlight.current || complete || names.length < 3) return;
    if (!window.confirm(`Select three winners from ${names.length} paid guests? The result will be saved and the guest list locked.`)) return;
    inFlight.current = true;
    setError(""); setRevealed(0); setRunning(true);
    try {
      const data = new FormData(); data.set("operation", "draw");
      const result = await updateBreakfast({}, data);
      if (!mounted.current) return;
      if (result.error || !result.winnerNames || !result.drawnAt) throw new Error(result.error ?? "Unable to confirm the result. Refresh to check the saved draw.");
      setLocalResult({ names: result.winnerNames, drawnAt: result.drawnAt, entrantCount: result.entrantCount ?? names.length });
      [1600, 2700, 3800].forEach((delay, index) => {
        timers.current.push(setTimeout(() => {
          if (!mounted.current) return;
          setRevealed(index + 1);
          if (index === 2) { setRunning(false); inFlight.current = false; }
        }, delay));
      });
    } catch (e) {
      setRunning(false); inFlight.current = false;
      setError(e instanceof Error ? e.message : "Unable to confirm the result. Refresh to check the saved draw.");
      router.refresh();
    }
  }
  return <section className={`drawStage ${running ? "isRunning" : ""} ${complete ? "isComplete" : ""}`} aria-busy={running}>
    <div className="drawStageGlow" aria-hidden="true" />
    <p className="drawStageEyebrow">SPREAD A SMILE · BREAKFAST DRAW</p>
    <h2>{complete ? "Our three lucky winners!" : running ? "Here come the winners…" : "Who will be our lucky three?"}</h2>
    <p className="drawStageIntro">{complete ? "Congratulations — and thank you for supporting Spread a Smile." : "One entry per paid guest. Three different winners. Let’s make someone’s day."}</p>
    <div className="drawReels" aria-hidden="true">{[0, 1, 2].map(index => {
      const won = index < visible;
      const rollingName = names.length ? names[(tick * (index + 3) + index * 7) % names.length] : "Your name here";
      return <article key={index} className={`drawReel ${won ? "isWinner" : running ? "isSpinning" : ""}`}>
        <span className="drawReelLabel">WINNER {index + 1}</span>
        <span className="drawMedal">{won ? "★" : "?"}</span>
        <div className="drawNameWindow"><strong className={running && !won ? "drawRollingName" : ""}>{won ? winners[index] : running ? rollingName : "Ready to win"}</strong></div>
        <span className="drawReelFoot">{won ? "CONGRATULATIONS!" : running ? "Selecting…" : "GOOD LUCK!"}</span>
      </article>;
    })}</div>
    <p className="drawAnnouncement" role="status" aria-live="polite" aria-atomic="true">{running ? visible ? `Winner ${visible}: ${winners[visible - 1]}.` : "Selecting three winners. Good luck!" : complete ? `The winners are ${winners.join(", ")}.` : `${names.length} paid guests entered.`}</p>
    {complete ? <div className="drawSaved"><span>✓ Result saved</span><p>Selected from {count} paid guests on {new Date(resultDate!).toLocaleString("en-GB", { timeZone: "Europe/London", dateStyle: "medium", timeStyle: "short" })}. Refreshing keeps the same winners.</p></div> : <>
      <button type="button" onClick={start} disabled={running || names.length < 3} className="drawStartButton">{running ? "Drawing the lucky three…" : "✦ Draw 3 winners"}</button>
      <p className="drawStageNote">{names.length < 3 ? "Add at least three paid guests to start." : running ? "The result is being saved and revealed. Please keep this screen open." : `${names.length} guests entered · Check the list first — the result is permanent.`}</p>
    </>}
    {error && <p role="alert" className="drawError">{error}</p>}
    <p className="drawFairness">Each guest has the same chance. The server selects and saves the winners; the animation reveals the result.</p>
  </section>;
}
