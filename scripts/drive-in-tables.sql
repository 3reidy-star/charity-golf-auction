-- Additive deployment script: apply once before deploying the Drive-In feature.
-- Existing auction lots and bids are unchanged.
CREATE TABLE "SquareBoard" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "closed" BOOLEAN NOT NULL DEFAULT false,
  "winningSquare" TEXT
);
CREATE TABLE "SquarePurchase" (
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
CREATE UNIQUE INDEX "SquarePurchase_checkoutId_key" ON "SquarePurchase"("checkoutId");
CREATE INDEX "SquarePurchase_boardId_status_expiresAt_idx" ON "SquarePurchase"("boardId", "status", "expiresAt");
CREATE TABLE "SquareClaim" (
  "boardId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "purchaseId" TEXT NOT NULL,
  CONSTRAINT "SquareClaim_pkey" PRIMARY KEY ("boardId", "code"),
  CONSTRAINT "SquareClaim_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "SquarePurchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "SquareClaim_purchaseId_idx" ON "SquareClaim"("purchaseId");
