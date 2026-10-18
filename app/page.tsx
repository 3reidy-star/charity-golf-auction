import AuctionClient from "@/app/components/AuctionClient";
import { prisma } from "@/app/lib";

export const dynamic = "force-dynamic";

export default async function Home() {
  const records = await prisma.lot.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      bids: {
        orderBy: [
          { amountPence: "desc" },
          { createdAt: "asc" },
        ],
        take: 1,
      },
    },
  });

  const lots = records.map((lot) => ({
    id: lot.id,
    golfClub: lot.golfClub,
    location: lot.location,
    expiry: lot.expiry.toISOString(),
    format: lot.format,
    sold: !lot.active,
    active: lot.active,
    minimumIncrementPence: lot.minimumIncrementPence,
    currentBidPence: lot.bids[0]?.amountPence ?? null,
    bidderName: lot.bids[0]?.bidderName ?? null,
  }));

  const total = lots.reduce(
    (sum, lot) => sum + (lot.currentBidPence ?? 0),
    0
  );

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">CHARITY GOLF FOUR-BALL AUCTION</p>
          <h1>Supporting Spread a Smile</h1>
        </div>

        <div className="raised">
          <span>Current total</span>
          <strong>£{Math.round(total / 100).toLocaleString("en-GB")}</strong>
        </div>
      </section>

      <div style={{ background: "#eef1ed", textAlign: "center", padding: "9px 12px", fontWeight: 800, fontSize: 17 }}>
        Bid online at: https://charity-golf-auction.vercel.app
      </div>

      <nav className="squaresNav"><a href="/squares">Captain’s Drive-In · Choose your £2 or £10 squares →</a></nav>

      <section className="auction">
        <AuctionClient lots={lots} />
      </section>

      <section className="charityInfo">
        <p className="eyebrow">ABOUT THE CHARITY</p>
        <h2>Spread a Smile</h2>

        <p>
          Spread a Smile supports seriously ill children and young people
          through hospital and virtual entertainer visits, family events
          and creative activities.
        </p>

        <p>
          Thank you to everyone taking part in the auction and helping us
          raise funds for Spread a Smile.
        </p>

        <a
          href="https://spreadasmile.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Find out more about Spread a Smile
        </a>
      </section>

      <footer>
        Thank you for supporting Spread a Smile charity auction.
      </footer>
    </main>
  );
}
