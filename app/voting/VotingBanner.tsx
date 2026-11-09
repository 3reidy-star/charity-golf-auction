import Link from "next/link";
export default function VotingBanner() {
  return <aside className="votingBanner"><div><span>YOUR CLUB · YOUR COMMITTEE</span><strong>Committee role voting</strong><p>Vote for the New Members and Media roles.</p></div><Link href="/voting">Go to voting →</Link></aside>;
}
