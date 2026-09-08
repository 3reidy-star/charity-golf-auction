import AuctionClient from "@/app/components/AuctionClient";
import { prisma } from "@/app/lib";

export const dynamic = "force-dynamic";

const AUCTION_CLOSES_AT = new Date("2026-09-12T15:00:00.000Z");
// 4:00pm UK time (BST)

const AUCTION_QR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNyAzNyIgc2hhcGUtcmVuZGVyaW5nPSJjcmlzcEVkZ2VzIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik00IDRoN3YxaC03ek0xMyA0aDF2MWgtMXpNMTUgNGgxdjFoLTF6TTE3IDRoMXYxaC0xek0xOSA0aDZ2MWgtNnpNMjYgNGgzdjFoLTN6TTMwIDRoM3YxaC0zek00IDVoMXYxaC0xek0xMCA1aDF2MWgtMXpNMTIgNWgxdjFoLTF6TTE0IDVoMXYxaC0xek0xNiA1aDF2MWgtMXpNMTggNWgxdjFoLTF6TTIwIDVoMXYxaC0xek0yMiA1aDF2MWgtMXpNMjQgNWgxdjFoLTF6TTI3IDVoMXYxaC0xek0zMCA1aDF2MWgtMXpNMzIgNWgxdjFoLTF6TTQgNmgxdjFoLTF6TTYgNmgzaDF2MWgtM3pNMTAgNmgxdjFoLTF6TTEzIDZoMnYxaC0yek0xNyA2aDF2MWgtMXpNMjAgNmgxdjFoLTF6TTIyIDZoMnYxaC0yek0yNiA2aDJ2MWgtMnpNMzAgNmgzdjFoLTN6TTQgN2gxdjFoLTF6TTYgN2gzaDF2MWgtM3pNMTAgN2gxdjFoLTF6TTEyIDdoMXYxaC0xek0xNSA3aDF2MWgtMXpNMTggN2gyaDF2MWgtMnpNMjEgN2gyaDF2MWgtMnpNMjUgN2gxdjFoLTF6TTI3IDdoMXYxaC0xek0zMCA3aDN2MWgtM3pNNCBoaDF2MWgtMXpNNiA4aDN2MWgtM3pNMTAgOGg5djFoLTl6TTIwIDhoMXYxaC0xek0yMyA4aDV2MWgtNXpNMzAgOGgzdjFoLTN6TTQgOWgxdjFoLTF6TTEwIDloMXYxaC0xek0xMyA5aDF2MWgtMXpNMTYgOWgxdjFoLTF6TTE4IDloMXYxaC0xek0yMSA5aDF2MWgtMXpNMjMgOWgxdjFoLTF6TTI3IDloMXYxaC0xek0zMCA5aDF2MWgtMXpNMzIgOWgxdjFoLTF6TTQgMTBoN3YxaC03ek0xMiAxMGgxdjFoLTF6TTE0IDEwaDF2MWgtMXpNMTYgMTBoMXYxaC0xek0xOCAxMGgxdjFoLTF6TTIwIDEwaDF2MWgtMXpNMjIgMTBoMXYxaC0xek0yNCAxMGgxdjFoLTF6TTI2IDEwaDF2MWgtMXpNMjggMTBoMXYxaC0xek0zMCAxMGgzdjFoLTN6TTEyIDExaDJ2MWgtMnpNMTYgMTFoMXYxaC0xek0yMCAxMWgydjFoLTJ6TTIzIDExaDF2MWgtMXpNMjUgMTFoMXYxaC0xek0yNyAxMWgxdjFoLTF6TTQgMTJoNWYxaC01ek0xMCAxMmgxdjFoLTF6TTEyIDEyaDF2MWgtMXpNMTQgMTJoMnYxaC0yek0xNyAxMmgyYjFoLTJ6TTIwIDEyaDF2MWgtMXpNMjQgMTJoM3YxaC0zek0yOCAxMmgyYjFoLTJ6TTMxIDEyaDJ2MWgtMnpNNSAxM2gxdjFoLTF6TTcgMTNoMXYxaC0xek05IDEzaDF2MWgtMXpNMTEgMTNoM3YxaC0zek0xNiAxM2gxdjFoLTF6TTE4IDEzaDF2MWgtMXpNMjIgMTNoMXYxaC0xek0yNCAxM2gxdjFoLTF6TTI2IDEzaDJ2MWgtMnpNMjkgMTNoMXYxaC0xek0zMSAxM2gxdjFoLTF6TTQgMTRoMXYxaC0xek02IDE0aDF2MWgtMXpNOCAxNGgxdjFoLTF6TTEwIDE0aDF2MWgtMXpNMTMgMTRoMXYxaC0xek0xNSAxNGgyaDF2MWgtMnpNMTggMTRoMnYxaC0yek0yMSAxNGgzdjFoLTN6TTI1IDE0aDF2MWgtMXpNMjcgMTRoMXYxaC0xek0yOSAxNGgxdjFoLTF6TTMxIDE0aDF2MWgtMXpNNSAxNWgzdjFoLTN6TTkgMTVoMXYxaC0xek0xMSAxNWgxdjFoLTF6TTE0IDE1aDF2MWgtMXpNMTYgMTVoNnYxaC02ek0yNSAxNWgxdjFoLTF6TTI4IDE1aDF2MWgtMXpNMzAgMTVoMnYxaC0yek00IDE2aDF2MWgtMXpNOCAxNmgxdjFoLTF6TTEwIDE2aDF2MWgtMXpNMTIgMTZoMnYxaC0yek0xNyAxNmgyYjFoLTJ6TTIyIDE2aDF2MWgtMXpNMjQgMTZoMXYxaC0xek0yNiAxNmgyYjFoLTJ6TTMwIDE2aDN2MWgtM3pNNC AxN2gyaDF2MWgtMnpNNyAxN2gxdjFoLTF6TTkgMTdoMXYxaC0xek0xMSAxN2gzYjFoLTN6TTE2IDE3aDJ2MWgtMnpNMjAgMTdoMnYxaC0yek0yMyAxN2gyYjFoLTJ6TTI2IDE3aDF2MWgtMXpNMjggMTdoMXYxaC0xek0zMCAxN2gxdjFoLTF6TTQgMThoMXYxaC0xek02IDE4aDF2MWgtMXpNOCAxOGgxdjFoLTF6TTEwIDE4aDF2MWgtMXpNMTMgMThoMXYxaC0xek0xNSAxOGgxdjFoLTF6TTE5IDE4aDF2MWgtMXpNMjIgMThoMnYxaC0yek0yNSAxOGgxdjFoLTF6TTI5IDE4aDF2MWgtMXpNMzEgMThoMnYxaC0yek01IDE5aDF2MWgtMXpNNyAxOWgxdjFoLTF6TTkgMTloMXYxaC0xek0xMSAxOWgyaDF2MWgtMnpNMTQgMTloMXYxaC0xek0xNiAxOWgzYjFoLTN6TTIwIDE5aDF2MWgtMXpNMjQgMTloMXYxaC0xek0yNiAxOWgyYjFoLTJ6TTMwIDE5aDF2MWgtMXpNNC AyMGgxdjFoLTF6TTYgMjBoMXYxaC0xek04IDIwaDF2MWgtMXpNMTAgMjBoMXYxaC0xek0xMyAyMGgxdjFoLTF6TTE1IDIwaDF2MWgtMXpNMTkgMjBoMXYxaC0xek0yMSAyMGgxdjFoLTF6TTIzIDIwaDF2MWgtMXpNMjUgMjBoMXYxaC0xek0yOCAyMGgxdjFoLTF6TTMxIDIwaDJ2MWgtMnpNNSAyMWgxdjFoLTF6TTcgMjFoMXYxaC0xek05IDIxaDF2MWgtMXpNMTEgMjFoM3YxaC0zek0xNCAyMWgxdjFoLTF6TTE2IDIxaDF2MWgtMXpNMTggMjFoMXYxaC0xek0yMCAyMWgxdjFoLTF6TTIyIDIxaDF2MWgtMXpNMjQgMjFoMXYxaC0xek0yNiAyMWgyaDF2MWgtMnpNMjkgMjFoM3YxaC0zek00IDIyaDF2MWgtMXpNNiAyMmgxdjFoLTF6TTggMjJoMXYxaC0xek0xMCAyMmgxdjFoLTF6TTEzIDIyaDF2MWgtMXpNMTUgMjJoMXYxaC0xek0xNyAyMmgxdjFoLTF6TTE5IDIyaDF2MWgtMXpNMjEgMjJoMXYxaC0xek0yMyAyMmgxdjFoLTF6TTI1IDIyaDF2MWgtMXpNMjggMjJoMXYxaC0xek0zMCAyMmgxdjFoLTF6TTMyIDIyaDF2MWgtMXpNNC AyM2gyaDF2MWgtMnpNNyAyM2gxdjFoLTF6TTkgMjNoMXYxaC0xek0xMSAyM2gyYjFoLTJ6TTE0IDIzaDF2MWgtMXpNMTYgMjNoMXYxaC0xek0xOCAyM2gxdjFoLTF6TTIwIDIzaDF2MWgtMXpNMjIgMjNoMXYxaC0xek0yNCAyM2gyaDF2MWgtMnpNMjcgMjNoMXYxaC0xek0yOSAyM2gxdjFoLTF6TTMxIDIzaDF2MWgtMXpNNC AyNGgxdjFoLTF6TTYgMjRoMXYxaC0xek04IDI0aDF2MWgtMXpNMTAgMjRoMXYxaC0xek0xMyAyNGgxdjFoLTF6TTE1IDI0aDF2MWgtMXpNMTcgMjRoMXYxaC0xek0xOSAyNGgxdjFoLTF6TTIxIDI0aDF2MWgtMXpNMjMgMjRoMXYxaC0xek0yNSAyNGgxdjFoLTF6TTI4IDI0aDF2MWgtMXpNMzAgMjRoMXYxaC0xek0zMiAyNGgxdjFoLTF6TTQgMjVoMXYxaC0xek01IDI1aDF2MWgtMXpNNyAyNWgxdjFoLTF6TTkgMjVoMXYxaC0xek0xMSAyNWgyYjFoLTJ6TTE0IDI1aDF2MWgtMXpNMTYgMjVoMXYxaC0xek0xOCAyNWgxdjFoLTF6TTIwIDI1aDF2MWgtMXpNMjIgMjVoMXYxaC0xek0yNCAyNWgyYjFoLTJ6TTI3IDI1aDF2MWgtMXpNMjkgMjVoMXYxaC0xek0zMSAyNWgxdjFoLTF6TTEyIDI2aDF2MWgtMXpNMTQgMjZoMXYxaC0xek0xNiAyNmgxdjFoLTF6TTE4IDI2aDF2MWgtMXpNMjAgMjZoMXYxaC0xek0yMiAyNmgxdjFoLTF6TTI0IDI2aDF2MWgtMXpNMjYgMjZoMXYxaC0xek0yOCAyNmgxdjFoLTF6TTQgMjdoN3YxaC03ek0xMiAyN2gyYjFoLTJ6TTE1IDI3aDF2MWgtMXpNMTcgMjdoMXYxaC0xek0xOSAyN2gxdjFoLTF6TTIxIDI3aDF2MWgtMXpNMjMgMjdoMXYxaC0xek0yNSAyN2gxdjFoLTF6TTI3IDI3aDF2MWgtMXpNMzAgMjdoM3YxaC0zek00IDI4aDF2MWgtMXpNMTAgMjhoMXYxaC0xek0xMyAyOGgxdjFoLTF6TTE1IDI4aDF2MWgtMXpNMTggMjhoMXYxaC0xek0yMCAyOGgxdjFoLTF6TTIyIDI4aDF2MWgtMXpNMjQgMjhoMXYxaC0xek0yNyAyOGgxdjFoLTF6TTMwIDI4aDF2MWgtMXpNMzIgMjhoMXYxaC0xek00IDI5aDF2MWgtMXpNNiAyOWgzYjFoLTN6TTEwIDI5aDF2MWgtMXpNMTIgMjloMXYxaC0xek0xNCAyOWgxdjFoLTF6TTE2IDI5aDJ2MWgtMnpNMTkgMjloMXYxaC0xek0yMSAyOWgxdjFoLTF6TTIzIDI5aDF2MWgtMXpNMjUgMjloMXYxaC0xek0yNyAyOWgxdjFoLTF6TTMwIDI5aDN2MWgtM3pNNC AzMGgxdjFoLTF6TTYgMzBoM3YxaC0zek0xMCAzMGgxdjFoLTF6TTEzIDMwaDF2MWgtMXpNMTUgMzBoMXYxaC0xek0xOCAzMGgxdjFoLTF6TTIwIDMwaDF2MWgtMXpNMjIgMzBoMXYxaC0xek0yNCAzMGgxdjFoLTF6TTI2IDMwaDF2MWgtMXpNMjggMzBoMXYxaC0xek0zMCAzMGgzdjFoLTN6TTQgMzFoMXYxaC0xek02IDMxaDN2MWgtM3pNMTAgMzFoMXYxaC0xek0xMiAzMWgxdjFoLTF6TTE0IDMxaDF2MWgtMXpNMTYgMzFoMXYxaC0xek0xOCAzMWgxdjFoLTF6TTIxIDMxaDF2MWgtMXpNMjMgMzFoMXYxaC0xek0yNSAzMWgxdjFoLTF6TTI3IDMxaDF2MWgtMXpNMzAgMzFoMXYxaC0xek0zMiAzMWgxdjFoLTF6TTQgMzJoN3YxaC03ek0xMyAzMmgxdjFoLTF6TTE1IDMyaDF2MWgtMXpNMTcgMzJoMXYxaC0xek0xOSAzMmgyaDF2MWgtMnpNMjIgMzJoMXYxaC0xek0yNCAzMmgxdjFoLTF6TTI2IDMyaDF2MWgtMXpNMjggMzJoMXYxaC0xek0zMCAzMmgzdjFoLTN6IiBmaWxsPSJibGFjayIvPjwvc3ZnPg==";

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
          <p className="eyebrow">CHARITY GOLF FOUR-BALL AUCTION</p>
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
            <strong>Auction closes at 4:00pm on Saturday 12 September 2026.</strong>
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

        <div className="heroSide">
          <div className="raised">
            <span>Current total</span>
            <strong>£{Math.round(total / 100).toLocaleString("en-GB")}</strong>
          </div>

          <div className="qrCode">
            <img src={AUCTION_QR} alt="QR code for the Charity Golf Auction website" />
            <strong>Scan to go to the website</strong>
          </div>
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
