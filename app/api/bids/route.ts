import { NextResponse } from "next/server";
import { prisma } from "@/app/lib";

const AUCTION_CLOSES_AT = new Date("2026-09-12T15:00:00.000Z");
// 4:00pm UK time (BST)

export async function POST(request: Request) {
  try {
    if (new Date() >= AUCTION_CLOSES_AT) {
      return NextResponse.json(
        { error: "The auction has now closed." },
        { status: 409 }
      );
    }

    const body = await request.json();

    const lotId = String(body.lotId || "");
    const bidderName = String(body.bidderName || "").trim();
    const amount = Number(body.amount);

    if (!lotId || !bidderName || !Number.isFinite(amount)) {
      return NextResponse.json(
        { error: "Please enter your name and bid amount." },
        { status: 400 }
      );
    }

    const amountPence = Math.round(amount * 100);

    if (amountPence <= 0) {
      return NextResponse.json(
        { error: "Please enter a bid greater than £0." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const lot = await tx.lot.findUnique({
        where: { id: lotId },
      });

      if (!lot || !lot.active) {
        throw new Error("LOT_CLOSED");
      }

      const current = await tx.bid.findFirst({
        where: { lotId },
        orderBy: [
          { amountPence: "desc" },
          { createdAt: "asc" },
        ],
      });

      if (current && amountPence <= current.amountPence) {
        throw new Error(`MINIMUM:${current.amountPence + 100}`);
      }

      return tx.bid.create({
        data: {
          lotId,
          bidderName,
          amountPence,
        },
      });
    });

    return NextResponse.json({
      ok: true,
      bidId: result.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "UNKNOWN";

    if (message === "LOT_CLOSED") {
      return NextResponse.json(
        { error: "This golf club is closed for bidding." },
        { status: 409 }
      );
    }

    if (message.startsWith("MINIMUM:")) {
      const minimum = Number(message.split(":")[1]) / 100;

      return NextResponse.json(
        {
          error: `Your bid must be at least £${minimum.toFixed(0)}.`,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "We couldn't place that bid. Please try again.",
      },
      { status: 500 }
    );
  }
}