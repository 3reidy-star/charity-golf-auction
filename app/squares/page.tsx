import Link from "next/link";
import SquaresClient from "./SquaresClient";
export default function SquaresPage() {
  return <main className="squaresPage"><header className="hero"><div><p className="eyebrow">SUPPORTING THE JOSHUA TARRANT TRUST</p><h1>Captain’s Drive-In</h1><p>Pick your spot. Support the charity.</p><Link href="/" style={{color:"white"}}>← Back to the auction</Link></div></header><SquaresClient /></main>;
}
