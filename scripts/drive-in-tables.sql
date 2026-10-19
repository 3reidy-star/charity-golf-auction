-- Additive, repeatable production deployment script for the Drive-In feature.
-- Existing auction lots and bids are unchanged.
BEGIN;
-- Serialize concurrent deployments of this additive setup.
SELECT pg_advisory_xact_lock(720261018);
CREATE TABLE IF NOT EXISTS "SquareBoard" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "closed" BOOLEAN NOT NULL DEFAULT false,
  "winningSquare" TEXT
);
CREATE TABLE IF NOT EXISTS "SquarePurchase" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "boardId" TEXT NOT NULL,
  "buyerName" TEXT NOT NULL,
  "squares" TEXT[],
  "amountPence" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "checkoutId" TEXT,
  "checkoutUrl" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "SquarePurchase_checkoutId_key" ON "SquarePurchase"("checkoutId");
CREATE INDEX IF NOT EXISTS "SquarePurchase_boardId_status_expiresAt_idx" ON "SquarePurchase"("boardId", "status", "expiresAt");
CREATE TABLE IF NOT EXISTS "SquareClaim" (
  "boardId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "purchaseId" TEXT NOT NULL,
  CONSTRAINT "SquareClaim_pkey" PRIMARY KEY ("boardId", "code"),
  CONSTRAINT "SquareClaim_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "SquarePurchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "SquareClaim_purchaseId_idx" ON "SquareClaim"("purchaseId");

COMMIT;

-- Paid breakfast guests and a single saved draw. Existing auction/payment data
-- is not changed. All list mutations and the draw lock the seeded state row.
CREATE TABLE IF NOT EXISTS "BreakfastEntry" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "nameKey" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "BreakfastDraw" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "winnerIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "winnerNames" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "entrantCount" INTEGER,
  "drawnAt" TIMESTAMP(3)
);
INSERT INTO "BreakfastDraw" ("id") VALUES ('breakfast') ON CONFLICT DO NOTHING;
