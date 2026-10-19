import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/src/lib/constants";

export function SiteFooter() {
  return <footer className="site-footer"><div className="container footer-inner"><div className="footer-brand"><Image src="/upv-logo.jpg" alt="" width={42} height={42} /><div><strong>{siteConfig.institution}</strong><span>{siteConfig.name}</span></div></div><nav aria-label="Footer navigation"><Link href="/">Home</Link><Link href="/services">Services</Link><Link href="/about">About</Link></nav></div></footer>;
}
