"use server";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib";
import { CODES, getBoard } from "@/app/squares/config";
import { cancelUnpaidPurchase, reconcilePurchase } from "@/app/squares/lib/orders";
async function authorize(){if(!process.env.ADMIN_PASSWORD||(await cookies()).get("auction_admin")?.value!==createHash("sha256").update(process.env.ADMIN_PASSWORD).digest("hex"))redirect("/admin");}
export async function updateBoard(form:FormData){
  await authorize();const id=String(form.get("boardId")),winningSquare=String(form.get("winningSquare")||"").trim().toUpperCase();
  if(!getBoard(id)||(winningSquare&&!CODES.includes(winningSquare)))return;
  const closed=form.get("closed")==="on"||!!winningSquare;
  await prisma.$transaction(async tx=>{
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${id}))`;
    await tx.squareBoard.upsert({where:{id},create:{id,closed,winningSquare:winningSquare||null},update:{closed,winningSquare:winningSquare||null}});
  });
  revalidatePath("/admin/squares");revalidatePath("/squares");
}
export async function checkPayment(form:FormData){await authorize();const id=String(form.get("purchaseId"));try{await reconcilePurchase(id);}catch{redirect("/admin/squares?error=verification");}revalidatePath("/admin/squares");}

export async function clearReservation(form:FormData){
  await authorize();
  const id=String(form.get("purchaseId")||"");
  if(!/^[a-f0-9-]{36}$/i.test(id))redirect("/admin/squares?error=missing");
  try{await cancelUnpaidPurchase(id);}catch(error){
    const reason=error instanceof Error&&error.message==="PAID"?"paid":error instanceof Error&&error.message==="CREATING"?"creating":"cancel";
    redirect(`/admin/squares?error=${reason}`);
  }
  revalidatePath("/squares");revalidatePath("/admin/squares");
  redirect("/admin/squares?cleared=1");
}
