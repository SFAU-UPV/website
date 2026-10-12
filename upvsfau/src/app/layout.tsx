import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { SiteFooter } from "@/src/components/site-footer";
import { siteConfig } from "@/src/lib/constants";
import "./globals.css";

export const metadata: Metadata = { title: { default: `${siteConfig.shortName} | ${siteConfig.institution}`, template: `%s | ${siteConfig.shortName}` }, description: siteConfig.description };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><SiteHeader /><main id="main-content">{children}</main><SiteFooter /></body></html>; }
