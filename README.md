# Charity 4 Ball Auction

Standalone single-page charity golf auction built with Next.js, Prisma and PostgreSQL.

## Features
- One public auction page only — no page per golf club
- Responsive desktop table / mobile cards
- Live current bid and bidder
- Bid modal on the same page
- Minimum bid increment enforcement on the server
- Seed data based on the supplied auction sheet
- Simple admin API foundation for closing/editing lots

## Local setup
1. Copy `.env.example` to `.env` and add a PostgreSQL/Neon `DATABASE_URL`.
2. Run `npm install`.
3. Run `npx prisma db push`.
4. Run `npm run db:seed`.
5. Run `npm run dev`.

## Deploy
Create a brand-new GitHub repository and Vercel project (do not add this to any Pastorfrigor repository). Add `DATABASE_URL` and `ADMIN_SECRET` to Vercel environment variables, then deploy.

## Captain’s Drive-In boards

`/squares` has two independent 11 × 13 boards (A1–K13): £2 and £10 per
square. Both start empty; the PowerPoint names are not imported. `/admin/squares`
uses the existing `ADMIN_PASSWORD` sign-in, shows purchases and verified totals,
closes boards, and announces a winning square. The supplied hole image is used
on both boards. Buyer names are public; card details stay with SumUp.

### Deployment

1. Production Vercel builds run `scripts/prepare-drive-in.cjs`, which applies
   the repeatable, additive SQL in `scripts/drive-in-tables.sql` using the
   existing `DATABASE_URL`. It creates only the new Drive-In tables and indexes.
   An advisory lock serializes concurrent deployments. Preview/local builds skip
   this step. For local setup, review and apply `npx prisma db push`.
   Do not reset or reseed the live auction database.
2. Configure server-only Vercel variables:
   - `SUMUP_API_KEY`: API key with checkout read/write permissions.
   - `SUMUP_MERCHANT_CODE`: the club’s merchant code.
   - `APP_URL`: `https://charity-golf-auction.vercel.app` (no trailing slash).
3. SumUp Hosted Checkout must be available on the merchant account. Confirm
   the event type is accepted by SumUp for the club’s account. Test with a
   SumUp sandbox merchant before adding live credentials.
4. Deploy and test checkout, return, callback, abandonment, simultaneous
   selection of the same square and admin closure. Also test completing an
   existing checkout after the board is closed.

Payments remain disabled until all three variables exist. Server prices are
fixed, independent of client input. Reservations use a board-level PostgreSQL
transaction lock and a unique `(boardId, code)` claim. Checkouts expire after
15 minutes. A claim is released only when SumUp confirms `EXPIRED`, or when
no checkout exists after the reservation deadline. A failed API call never
blindly releases a potentially paid square. `FAILED` is treated as pending
because another payment attempt may still be possible.

Payment callbacks re-fetch the checkout from SumUp and verify the reference,
amount, GBP currency and merchant before marking paid. Duplicate callbacks
are idempotent. If checkout creation times out, the reservation can recover the
remote checkout by its reference. Expired reservations reconcile on board reads;
payment return pages and the admin “Check payment” action also reconcile.
During a SumUp outage claims remain reserved rather than risking double sales.
Closing a board prevents new reservations; existing checkouts can still settle.

Run `npm run test:squares` for the selection and payment-verification tests.


## Breakfast paid guest draw

Open `/admin`, sign in with the existing admin password, then choose **Breakfast
paid guest list & draw 3 winners**. Add names only after breakfast has been paid
for (one name per line). Each person receives one entry; add an initial or other
detail for different people with the same name. Entries can be removed before
the draw. **Select 3 winners** uses server-side cryptographic randomness without
replacement and saves the result permanently. At least three guests are required.
The guest list locks once drawn; refreshing or clicking twice cannot redraw it.
Three animated name reels reveal the saved winners one at a time; the animation
does not choose the winners. Reduced-motion preferences are respected.
The list and results are admin-only. No breakfast payments are collected online.

The existing production table setup also creates the two breakfast tables and
seeds the draw state. It is additive and does not change auction bids or SumUp
payments. Preview/local builds skip database setup as before.

Run `npm run test:breakfast` to check name validation and winner selection.
