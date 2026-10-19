import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/src/lib/constants";
import { MobileNav } from "@/src/components/mobile-nav";
import { ServicesMenu } from "@/src/components/services-menu";

export function SiteHeader() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Link
            href="/"
            className="brand"
            aria-label={`${siteConfig.institution} ${siteConfig.shortName} home`}
          >
            <Image
              className="brand-mark"
              src="/upv-logo.jpg"
              alt=""
              width={46}
              height={46}
              priority
            />
            <span>
              <strong>{siteConfig.institution}</strong>
              <small>{siteConfig.name}</small>
            </span>
          </Link>
          <nav aria-label="Primary navigation" className="primary-nav">
            <Link href="/">Home</Link>
            <ServicesMenu />
            <Link href="/about">About</Link>
            <form className="header-search" role="search" action="/search" method="get">
              <label className="sr-only" htmlFor="header-search-input">
                Search SFAU programs
              </label>
              <input id="header-search-input" name="q" type="search" placeholder="Search" />
              <button type="submit">
                <span aria-hidden="true">⌕</span>
                <span className="sr-only">Search</span>
              </button>
            </form>
          </nav>
          <MobileNav />
        </div>
      </header>
    </>
  );
}
