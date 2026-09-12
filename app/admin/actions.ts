"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createHash } from "crypto";
import { prisma } from "@/app/lib";

function adminToken() {
  const password = process.env.ADMIN_PASSWORD || "";
  return createHash("sha256").update(password).digest("hex");
}

async function requireAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("auction_admin")?.value !== adminToken()) redirect("/admin");
}

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get("password") || "");
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) redirect("/admin?error=1");
  const cookieStore = await cookies();
  cookieStore.set("auction_admin", adminToken(), { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 });
  redirect("/admin");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("auction_admin");
  redirect("/admin");
}

export async function addLot(formData: FormData) {
  await requireAdmin();
  const golfClub = String(formData.get("golfClub") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const format = String(formData.get("format") || "").trim();
  const expiry = String(formData.get("expiry") || "").trim();
  if (!golfClub || !location || !format || !expiry) return;
  const lastLot = await prisma.lot.findFirst({ orderBy: { displayOrder: "desc" }, select: { displayOrder: true } });
  await prisma.lot.create({ data: { golfClub, location, format, expiry: new Date(`${expiry}T12:00:00.000Z`), displayOrder: (lastLot?.displayOrder ?? 0) + 1, minimumIncrementPence: 500, active: true } });
  revalidatePath("/"); revalidatePath("/admin");
}

export async function setWinner(formData: FormData) {
  await requireAdmin();
  const lotId = String(formData.get("lotId") || "");
  const bidderName = String(formData.get("bidderName") || "").trim();
  const amount = Number(formData.get("amount"));
  if (!lotId || !bidderName || !Number.isFinite(amount) || amount <= 0) return;
  await prisma.bid.create({ data: { lotId, bidderName, amountPence: Math.round(amount * 100) } });
  revalidatePath("/"); revalidatePath("/admin");
}

export async function deleteBid(formData: FormData) {
  await requireAdmin();
  const bidId = String(formData.get("bidId") || "");
  if (bidId) await prisma.bid.delete({ where: { id: bidId } });
  revalidatePath("/"); revalidatePath("/admin");
}

export async function editWinningBid(formData: FormData) {
  await requireAdmin();
  const bidId = String(formData.get("bidId") || "");
  const bidderName = String(formData.get("bidderName") || "").trim();
  const amount = Number(formData.get("amount"));
  if (!bidId || !bidderName || !Number.isFinite(amount) || amount <= 0) return;
  await prisma.bid.update({ where: { id: bidId }, data: { bidderName, amountPence: Math.round(amount * 100) } });
  revalidatePath("/"); revalidatePath("/admin");
}

export async function toggleLot(formData: FormData) {
  await requireAdmin();
  const lotId = String(formData.get("lotId") || "");
  const active = String(formData.get("active")) === "true";
  if (lotId) await prisma.lot.update({ where: { id: lotId }, data: { active: !active } });
  revalidatePath("/"); revalidatePath("/admin");
}
