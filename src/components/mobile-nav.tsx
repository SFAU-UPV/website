"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { services } from "@/src/types/domain";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>("a, summary")?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  function closeMenu() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <div className="mobile-nav">
      <button
        ref={buttonRef}
        className="menu-button"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">{open ? "\u00D7" : "\u2630"}</span>
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>
      {open && (
        <nav ref={menuRef} id="mobile-menu" className="mobile-menu" aria-label="Mobile navigation">
          <Link href="/" onClick={closeMenu}>
            Home
          </Link>
          <details>
            <summary>Services</summary>
            <div>
              {services.map((service) => (
                <Link key={service.slug} href={`/services/${service.slug}`} onClick={closeMenu}>
                  {service.name}
                </Link>
              ))}
            </div>
          </details>
          <Link href="/about" onClick={closeMenu}>
            About
          </Link>
          <Link href="/search" onClick={closeMenu}>
            Search
          </Link>
        </nav>
      )}
    </div>
  );
}
