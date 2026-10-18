import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Spread a Smile | Charity 4 Ball Auction", description: "Charity golf four-ball auction and Captain’s Drive-In supporting Spread a Smile" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
