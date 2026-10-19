import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
export async function requireBreakfastAdmin() {
  const password = process.env.ADMIN_PASSWORD;
  const token = (await cookies()).get("auction_admin")?.value;
  if (!password || !token) redirect("/admin");
  const expected = createHash("sha256").update(password).digest("hex");
  const a = Buffer.from(token), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) redirect("/admin");
}
