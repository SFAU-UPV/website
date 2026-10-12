import Link from "next/link";
import { siteConfig } from "@/src/lib/constants";

export function SiteFooter() {
  return <footer className="site-footer"><div className="container footer-inner"><div><strong>{siteConfig.institution}</strong><span>{siteConfig.name}</span></div><nav aria-label="Footer navigation"><Link href="/">Home</Link><Link href="/services">Services</Link><Link href="/about">About</Link></nav></div></footer>;
}
