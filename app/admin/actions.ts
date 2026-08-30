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

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get("password") || "");

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin?error=1");
  }

  const cookieStore = await cookies();

  cookieStore.set("auction_admin", adminToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  redirect("/admin");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("auction_admin");
  redirect("/admin");
}

export async function deleteBid(formData: FormData) {
  const cookieStore = await cookies();

  if (cookieStore.get("auction_admin")?.value !== adminToken()) {
    redirect("/admin");
  }

  const bidId = String(formData.get("bidId") || "");

  if (bidId) {
    await prisma.bid.delete({
      where: { id: bidId },
    });
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function toggleLot(formData: FormData) {
  const cookieStore = await cookies();

  if (cookieStore.get("auction_admin")?.value !== adminToken()) {
    redirect("/admin");
  }

  const lotId = String(formData.get("lotId") || "");
  const active = String(formData.get("active")) === "true";

  if (lotId) {
    await prisma.lot.update({
      where: { id: lotId },
      data: {
        active: !active,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/admin");
}