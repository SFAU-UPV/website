import type { Metadata } from "next";
import { Suspense } from "react";
import { Poppins } from "next/font/google";
import { SiteHeader } from "@/src/components/site-header";
import { SiteFooter } from "@/src/components/site-footer";
import { ScrollEntrances } from "@/src/components/scroll-entrances";
import { siteConfig } from "@/src/lib/constants";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.shortName} | ${siteConfig.institution}`,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  icons: { icon: "/favicon-upv.png", shortcut: "/favicon-upv.png", apple: "/favicon-upv.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body suppressHydrationWarning>
        <SiteHeader />
        <Suspense fallback={null}>
          <ScrollEntrances />
        </Suspense>
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
