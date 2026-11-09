BEGIN;
CREATE TABLE IF NOT EXISTS "CommitteeElection" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "open" BOOLEAN NOT NULL DEFAULT false,
  "openedAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3)
);
CREATE TABLE IF NOT EXISTS "CommitteeBallot" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "electionId" TEXT NOT NULL REFERENCES "CommitteeElection"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "voterHash" TEXT NOT NULL,
  "newMembers" TEXT NOT NULL CHECK ("newMembers" IN ('jose-cubides','joe-andrews','adrian-baines','abstain')),
  "media" TEXT NOT NULL CHECK ("media" IN ('joe-andrews','carl-thomas','abstain')),
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommitteeBallot_has_vote" CHECK ("newMembers" <> 'abstain' OR "media" <> 'abstain')
);
CREATE UNIQUE INDEX IF NOT EXISTS "CommitteeBallot_electionId_voterHash_key" ON "CommitteeBallot"("electionId","voterHash");
INSERT INTO "CommitteeElection" ("id") VALUES ('committee-2026') ON CONFLICT DO NOTHING;
COMMIT;
