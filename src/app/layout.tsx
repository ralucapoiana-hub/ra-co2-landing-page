import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-montserrat",
});
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/400-italic.css";
import "./globals.css";

import fs from 'fs/promises';
import path from 'path';

// Read SEO metadata dynamically at build/request time
async function getSeoMetadata() {
  // If we are on Vercel or building, try to read the local file first for stability
  try {
    const seoFilePath = path.join(process.cwd(), 'data', 'seo.json');
    const localData = await fs.readFile(seoFilePath, 'utf8');
    return JSON.parse(localData);
  } catch (error) {
    // If local file fails, try the API as a secondary fallback (useful for revalidation)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      // Only try fetch if the URL looks valid and it's not build time
      if (baseUrl.startsWith('http')) {
        const res = await fetch(`${baseUrl}/api/seo`, { next: { revalidate: 60 } });
        if (res.ok) return await res.json();
      }
    } catch (e) {
      console.warn("Metadata fetch suppressed (safe):", e);
    }
    
    // Final hardcoded defaults
    return {
      title: "The Regenerative Aesthetics",
      description: "Advanced aesthetic treatments at 82 Harley Street."
    };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata();
  return {
    title: seo.title,
    description: seo.description,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${montserrat.variable}`}>
      <body className="antialiased bg-[#FAFAFA] text-[#0A1128] font-sans selection:bg-[#C8B598] selection:text-white">
        {children}
      </body>
    </html>
  );
}
