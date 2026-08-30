import { NextResponse } from "next/server";
import { prisma } from "@/app/lib";

function authorised(request: Request) {
  return request.headers.get("x-admin-secret") === process.env.ADMIN_SECRET;
}

export async function PATCH(request: Request) {
  if (!authorised(request)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const body = await request.json();
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "Missing lot id" }, { status: 400 });

  const lot = await prisma.lot.update({
    where: { id },
    data: {
      golfClub: body.golfClub,
      location: body.location,
      format: body.format,
      active: typeof body.active === "boolean" ? body.active : undefined,
      minimumIncrementPence: body.minimumIncrementPence
    }
  });
  return NextResponse.json({ ok: true, lot });
}
