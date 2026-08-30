"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Lot = {
  id: string;
  golfClub: string;
  location: string;
  expiry: string;
  format: string;
  active: boolean;
  minimumIncrementPence: number;
  currentBidPence: number | null;
  bidderName: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(value));
}

function formatMoney(pence: number | null) {
  return pence ? `£${Math.round(pence / 100)}` : "No bids";
}

export default function AuctionClient({ lots }: { lots: Lot[] }) {
  const router = useRouter();

  const [selected, setSelected] = useState<Lot | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const openBid = (lot: Lot) => {
    const minimumPence = lot.currentBidPence
      ? lot.currentBidPence + lot.minimumIncrementPence
      : lot.minimumIncrementPence;

    setSelected(lot);
    setName("");
    setAmount(String(Math.round(minimumPence / 100)));
    setError("");
    setSuccess("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    setBusy(true);
    setError("");

    const res = await fetch("/api/bids", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        lotId: selected.id,
        bidderName: name,
        amount: Number(amount),
      }),
    });

    const data = await res.json();

    setBusy(false);

    if (!res.ok) {
      return setError(data.error || "Unable to place bid.");
    }

    setSuccess("Bid placed — you're currently the highest bidder.");
    router.refresh();

    setTimeout(() => {
      setSelected(null);
    }, 1000);
  };

  return (
    <>
      <div className="desktopTable">
        <div className="thead row">
          <div>Golf Club</div>
          <div>Location</div>
          <div>Expiry</div>
          <div>Format</div>
          <div>Current Bid</div>
          <div>Bidder</div>
          <div></div>
        </div>

        {lots.map((lot) => (
          <div className="row" key={lot.id}>
            <div className="club">{lot.golfClub}</div>
            <div>{lot.location}</div>
            <div>{formatDate(lot.expiry)}</div>
            <div>{lot.format}</div>
            <div className="price">{formatMoney(lot.currentBidPence)}</div>
            <div>{lot.bidderName || "—"}</div>
            <div>
              <button
                disabled={!lot.active}
                onClick={() => openBid(lot)}
              >
                {lot.active ? "Place bid" : "Closed"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mobileCards">
        {lots.map((lot) => (
          <article className="card" key={lot.id}>
            <h2>{lot.golfClub}</h2>

            <p>
              {lot.location} · {lot.format}
            </p>

            <p className="muted">
              Voucher expiry {formatDate(lot.expiry)}
            </p>

            <div className="mobileBid">
              <div>
                <span>Current bid</span>
                <strong>{formatMoney(lot.currentBidPence)}</strong>
                <small>{lot.bidderName || "No bidder yet"}</small>
              </div>

              <button
                disabled={!lot.active}
                onClick={() => openBid(lot)}
              >
                {lot.active ? "Place bid" : "Closed"}
              </button>
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <div
          className="overlay"
          onMouseDown={() => !busy && setSelected(null)}
        >
          <div
            className="modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              ×
            </button>

            <p className="eyebrow">PLACE A BID</p>

            <h2>{selected.golfClub}</h2>

            <p className="modalSub">
              Current bid:{" "}
              <strong>{formatMoney(selected.currentBidPence)}</strong>
            </p>

            <form onSubmit={submit}>
              <label>
                Name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </label>

              <label>
                Your bid (£)
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </label>

              {error && <div className="error">{error}</div>}
              {success && <div className="success">{success}</div>}

              <button
                className="submit"
                disabled={busy}
              >
                {busy ? "Placing bid…" : "Confirm bid"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}