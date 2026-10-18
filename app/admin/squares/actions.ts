"use server";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib";
import { CODES, getBoard } from "@/app/squares/config";
import { reconcilePurchase } from "@/app/squares/lib/orders";
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
