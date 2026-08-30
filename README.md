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
