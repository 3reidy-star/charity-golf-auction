import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const lots = [
  ["Aldwickbury GC", "Harpenden", "2028-04-01", "Mon - Fri", 0, ""],
  ["Brampton Park GC", "Cambridgeshire", "2027-07-01", "Mon - Fri", 0, ""],
  ["Brookman’s Park GC", "Hatfield", "2027-09-12", "Mon - Fri", 0, ""],
  ["Chigwell GC", "Chigwell", "2027-09-12", "Mon - Fri", 0, ""],
  ["Clacton on Sea", "Clacton", "2027-12-31", "Mon - Fri", 0, ""],
  ["Crondon Park GC", "Stock", "2027-07-01", "Mon - Sun", 10000, "Jo Andrews"],
  ["Dryham Park GC", "Barnet", "2027-07-08", "Mon - Fri", 10000, "Paul Thompson"],
  ["Eaton GC", "Norwich", "2027-12-01", "Mon - Fri", 0, ""],
  ["Great Yarmouth & Caister", "Yarmouth", "2027-10-31", "Mon - Sun", 0, ""],
  ["Stowmarket GC", "Stowmarket", "2027-09-12", "Mon - Fri", 0, ""],
  ["The Oxfordshire GC", "Milton Common", "2027-07-01", "Mon - Fri", 0, ""],
  ["Westerham GC", "Kent", "2026-12-31", "Mon - Sun", 14000, "Tim Green"]
] as const;

async function main() {
  await prisma.bid.deleteMany();
  await prisma.lot.deleteMany();

  for (let i = 0; i < lots.length; i++) {
    const [golfClub, location, expiry, format, amountPence, bidderName] = lots[i];
    const lot = await prisma.lot.create({
      data: {
        golfClub,
        location,
        expiry: new Date(`${expiry}T12:00:00.000Z`),
        format,
        displayOrder: i + 1,
        minimumIncrementPence: 500
      }
    });

    if (amountPence > 0 && bidderName) {
      await prisma.bid.create({
        data: {
          lotId: lot.id,
          bidderName,
          amountPence
        }
      });
    }
  }
}

main().finally(() => prisma.$disconnect());
