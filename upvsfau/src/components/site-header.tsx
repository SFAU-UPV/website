import Link from "next/link";
import { siteConfig } from "@/src/lib/constants";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label={`${siteConfig.institution} ${siteConfig.shortName} home`}>
          <span className="brand-mark" aria-hidden="true">UPV</span>
          <span><strong>{siteConfig.institution}</strong><small>{siteConfig.name}</small></span>
        </Link>
        <nav aria-label="Primary navigation" className="primary-nav">
          <Link href="/">Home</Link>
          <Link href="/services">Services</Link>
          <Link href="/about">About</Link>
        </nav>
      </div>
    </header>
  );
}