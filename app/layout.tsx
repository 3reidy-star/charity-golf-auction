import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Charity 4 Ball Auction", description: "Charity golf four-ball auction" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
