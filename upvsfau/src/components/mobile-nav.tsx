"use client";

import Link from "next/link";
import { useState } from "react";
import { services } from "@/src/types/domain";

export function MobileNav() { const [open, setOpen] = useState(false); return <div className="mobile-nav"><button className="menu-button" type="button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}><span aria-hidden="true">{open ? "×" : "☰"}</span><span className="sr-only">{open ? "Close menu" : "Open menu"}</span></button>{open && <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile navigation"><Link href="/" onClick={() => setOpen(false)}>Home</Link><details><summary>Services</summary><div>{services.map((service) => <Link key={service.slug} href={`/services/${service.slug}`} onClick={() => setOpen(false)}>{service.name}</Link>)}</div></details><Link href="/about" onClick={() => setOpen(false)}>About</Link><Link href="/search" onClick={() => setOpen(false)}>Search</Link></nav>}</div>; }
