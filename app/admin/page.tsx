import { cookies } from "next/headers";
import { createHash } from "crypto";
import { prisma } from "@/app/lib";
import {
  addLot,
  deleteBid,
  editWinningBid,
  loginAdmin,
  logoutAdmin,
  toggleLot,
} from "./actions";

export const dynamic = "force-dynamic";

function adminToken() {
  return createHash("sha256")
    .update(process.env.ADMIN_PASSWORD || "")
    .digest("hex");
}

function money(pence: number) {
  return `£${(pence / 100).toFixed(0)}`;
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const cookieStore = await cookies();
  const params = await searchParams;
  const authenticated = !!process.env.ADMIN_PASSWORD && cookieStore.get("auction_admin")?.value === adminToken();

  if (!authenticated) {
    return (
      <main style={{ maxWidth: 500, margin: "80px auto", padding: 24 }}>
        <h1>Auction Admin</h1>
        <p>Enter the administrator password.</p>
        {params.error && <p style={{ color: "crimson" }}>Incorrect password.</p>}
        <form action={loginAdmin}>
          <input type="password" name="password" required placeholder="Admin password" style={{ width: "100%", padding: 12, marginBottom: 12, fontSize: 16 }} />
          <button type="submit">Sign in</button>
        </form>
      </main>
    );
  }

  const lots = await prisma.lot.findMany({ orderBy: { displayOrder: "asc" }, include: { bids: { orderBy: { createdAt: "desc" } } } });
  const total = lots.reduce((sum, lot) => {
    const highest = [...lot.bids].sort((a, b) => b.amountPence - a.amountPence)[0];
    return sum + (highest?.amountPence ?? 0);
  }, 0);

  const inputStyle = { padding: 9, border: "1px solid #ccc", borderRadius: 6 };

  return (
    <main style={{ maxWidth: 1200, margin: "40px auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center", marginBottom: 24 }}>
        <div>
          <p style={{ margin: 0 }}>CHARITY AUCTION</p>
          <h1 style={{ marginTop: 4 }}>Admin</h1>
          <p>Current winning total: <strong>{money(total)}</strong></p>
        </div>
        <form action={logoutAdmin}><button type="submit">Sign out</button></form>
      </div>

      <section style={{ border: "2px solid #24563d", borderRadius: 12, padding: 18, marginBottom: 28, background: "#f5faf7" }}>
        <h2 style={{ marginTop: 0 }}>Add auction lot</h2>
        <form action={addLot} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
          <label style={{ display: "grid", gap: 4, fontWeight: 700 }}>Course<input name="golfClub" required defaultValue="The Wisley or Wentworth" style={{ ...inputStyle, minWidth: 220 }} /></label>
          <label style={{ display: "grid", gap: 4, fontWeight: 700 }}>Location<input name="location" required defaultValue="Surrey" style={{ ...inputStyle, width: 140 }} /></label>
          <label style={{ display: "grid", gap: 4, fontWeight: 700 }}>Format / restriction<input name="format" required defaultValue="2 Ball - Must be played in November" style={{ ...inputStyle, minWidth: 260 }} /></label>
          <label style={{ display: "grid", gap: 4, fontWeight: 700 }}>Expiry<input name="expiry" type="date" required defaultValue="2026-11-30" style={inputStyle} /></label>
          <button type="submit">Add lot</button>
        </form>
      </section>

      {lots.map((lot) => {
        const sortedBids = [...lot.bids].sort((a, b) => b.amountPence - a.amountPence);
        const winningBid = sortedBids[0];
        return (
          <section key={lot.id} style={{ border: lot.active ? "1px solid #ddd" : "2px solid #9c2f2f", borderRadius: 12, padding: 20, marginBottom: 20, background: lot.active ? "white" : "#fff7f7" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
              <div><h2 style={{ marginBottom: 5 }}>{lot.golfClub}</h2><p style={{ marginTop: 0 }}><strong style={{ color: lot.active ? "#195633" : "#9c2f2f" }}>{lot.active ? "OPEN" : "SOLD"}</strong>{winningBid && <> · {lot.active ? "Current highest bid" : "Sold for"} <strong>{money(winningBid.amountPence)}</strong> by <strong>{winningBid.bidderName}</strong></>}</p></div>
              <form action={toggleLot}><input type="hidden" name="lotId" value={lot.id} /><input type="hidden" name="active" value={String(lot.active)} /><button type="submit">{lot.active ? "Mark sold" : "Reopen lot"}</button></form>
            </div>

            {winningBid && (
              <form action={editWinningBid} style={{ display: "flex", gap: 10, alignItems: "end", flexWrap: "wrap", padding: "12px 0 16px", borderTop: "1px solid #eee", marginTop: 8 }}>
                <input type="hidden" name="bidId" value={winningBid.id} />
                <label style={{ display: "grid", gap: 4, fontWeight: 700 }}>Winner<input name="bidderName" defaultValue={winningBid.bidderName} required style={{ padding: 9, minWidth: 180 }} /></label>
                <label style={{ display: "grid", gap: 4, fontWeight: 700 }}>Winning bid (£)<input name="amount" type="number" min="1" step="1" defaultValue={winningBid.amountPence / 100} required style={{ padding: 9, width: 130 }} /></label>
                <button type="submit">Save winner</button>
              </form>
            )}

            {lot.bids.length === 0 ? <p>No bids yet.</p> : (
              <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th align="left">Bidder</th><th align="left">Bid</th><th align="left">Time</th><th></th></tr></thead><tbody>{lot.bids.map((bid) => <tr key={bid.id}><td style={{ padding: "10px 0" }}>{bid.bidderName}</td><td>{money(bid.amountPence)}</td><td>{bid.createdAt.toLocaleString("en-GB", { timeZone: "Europe/London", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td><td align="right"><form action={deleteBid}><input type="hidden" name="bidId" value={bid.id} /><button type="submit">Delete</button></form></td></tr>)}</tbody></table></div>
            )}
          </section>
        );
      })}
    </main>
  );
}
