import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/src/lib/constants";
import { DeveloperCredit } from "@/src/components/developer-credit";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-column footer-quick-links">
          <h2>Quick links</h2>
          <nav aria-label="Footer navigation">
            <Link href="/">Home</Link>
            <Link href="/services">Services</Link>
            <Link href="/search">Search programs</Link>
            <Link href="/about">About OSA-SFAU</Link>
          </nav>
        </div>
        <div className="footer-column footer-up-links">
          <h2>UP Visayas</h2>
          <a href="https://upv.edu.ph/" target="_blank" rel="noreferrer">
            University of the Philippines Visayas
          </a>
          <a href="https://up.edu.ph/" target="_blank" rel="noreferrer">
            UP System
          </a>
          <a href="https://upcat.up.edu.ph/" target="_blank" rel="noreferrer">
            UPCAT
          </a>
          <a href="https://crs.upv.edu.ph/" target="_blank" rel="noreferrer">
            CRSIS
          </a>
        </div>
        <div className="footer-column footer-contact">
          <div className="footer-brand">
            <Image src="/upv-logo.jpg" alt="" width={48} height={48} />
            <div>
              <strong>{siteConfig.institution}</strong>
              <span>{siteConfig.name}</span>
            </div>
          </div>
          <address>
            <span>{siteConfig.contact.office}</span>
            <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>
            <a href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, "")}`}>
              {siteConfig.contact.phone}
            </a>
            <span>{siteConfig.contact.hours}</span>
          </address>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <span>Official information from OSA-SFAU, UP Visayas.</span>
          <div className="footer-bottom-links">
            <a href="https://upv.edu.ph/" target="_blank" rel="noreferrer">upv.edu.ph</a>
            <DeveloperCredit />
          </div>
        </div>
      </div>
    </footer>
  );
}
