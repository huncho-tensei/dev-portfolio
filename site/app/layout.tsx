import type { Metadata } from "next";
import { IBM_Plex_Mono, Pixelify_Sans } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";

const pixelify = Pixelify_Sans({ variable: "--font-pixelify", subsets: ["latin"], weight: ["500", "700"] });
const plex = IBM_Plex_Mono({ variable: "--font-plex", subsets: ["latin"], weight: ["400", "600"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://hawioyugi.com"),
  title: site.title,
  description: site.description,
  authors: [{ name: site.name }],
  openGraph: { title: site.title, description: site.description, type: "website", url: "https://hawioyugi.com" },
  twitter: { card: "summary_large_image", title: site.title, description: site.description, creator: "@paroadster" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${pixelify.variable} ${plex.variable}`}>
      <body>{children}</body>
    </html>
  );
}
