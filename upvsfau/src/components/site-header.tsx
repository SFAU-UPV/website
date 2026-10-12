import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/src/lib/constants";
import { MobileNav } from "@/src/components/mobile-nav";
import { services } from "@/src/types/domain";

export function SiteHeader() {
  return (
    <><a className="skip-link" href="#main-content">Skip to content</a><header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label={`${siteConfig.institution} ${siteConfig.shortName} home`}>
          <Image className="brand-mark" src="/upv-logo.jpg" alt="" width={46} height={46} priority />
          <span><strong>{siteConfig.institution}</strong><small>{siteConfig.name}</small></span>
        </Link>
        <nav aria-label="Primary navigation" className="primary-nav">
          <Link href="/">Home</Link>
          <details className="services-menu"><summary>Services</summary><div className="services-dropdown">{services.map((service) => <Link href={`/services/${service.slug}`} key={service.slug}>{service.name}</Link>)}</div></details>
          <Link href="/about">About</Link>
          <Link href="/search" aria-label="Search">⌕</Link>
        </nav>
        <MobileNav />
      </div>
    </header></>
  );
}
