import type { Metadata } from "next";
import { DM_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "Ourchother | AI-Native Agency for Growth",
  description: "Multimodal agency providing AI-first consulting, strategic business guidance, and custom development. Growing abundant businesses together.",
};

// Export fonts for use in components
export const fonts = {
  sans: dmSans,
  serif: cormorantGaramond,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${cormorantGaramond.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
