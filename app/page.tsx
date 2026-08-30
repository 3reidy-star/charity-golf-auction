import AuctionClient from "@/app/components/AuctionClient";
import { prisma } from "@/app/lib";

export const dynamic = "force-dynamic";

const AUCTION_CLOSES_AT = new Date("2026-09-12T15:00:00.000Z");
// 4:00pm UK time (BST)

export default async function Home() {
  const auctionClosed = new Date() >= AUCTION_CLOSES_AT;

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
    active: lot.active && !auctionClosed,
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
          <p className="eyebrow">
            CHARITY GOLF FOUR-BALL AUCTION
          </p>

          <h1>Supporting the Joshua Tarrant Trust</h1>

          <p className="intro">
            Bid on a four-ball at one of our donated golf clubs and help
            raise valuable funds for the Joshua Tarrant Trust.
          </p>

          <p className="intro">
            The Joshua Tarrant Trust is an East of England registered
            charity dedicated to supporting children with brain tumours.
            Joshua William Tarrant is the inspiration behind the charity.
          </p>

          <p className="intro">
            <strong>
              Auction closes at 4:00pm on Saturday 12 September 2026.
            </strong>
          </p>

          {auctionClosed && (
            <p className="intro">
              <strong>The auction is now closed.</strong>
            </p>
          )}

          <p className="intro">
            <a
              href="https://joshuatarranttrust.org.uk/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit the Joshua Tarrant Trust website
            </a>
          </p>
        </div>

        <div className="raised">
          <span>Current total</span>
          <strong>
            £{Math.round(total / 100).toLocaleString("en-GB")}
          </strong>
        </div>
      </section>

      <section className="auction">
        <AuctionClient lots={lots} />
      </section>

      <section className="charityInfo">
        <p className="eyebrow">ABOUT THE CHARITY</p>

        <h2>Joshua Tarrant Trust</h2>

        <p>
          The Joshua Tarrant Trust is dedicated to supporting children
          with brain tumours across the East of England. Joshua William
          Tarrant is the inspiration behind the charity.
        </p>

        <p>
          Thank you to everyone taking part in the auction and helping us
          raise funds for the Trust.
        </p>

        <a
          href="https://joshuatarranttrust.org.uk/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Find out more about the Joshua Tarrant Trust
        </a>
      </section>

      <footer>
        Thank you for supporting the Joshua Tarrant Trust charity auction.
      </footer>
    </main>
  );
}