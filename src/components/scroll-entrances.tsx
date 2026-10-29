"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollEntrances() {
  const pathname = usePathname();

  useEffect(() => {
    if (
      pathname.startsWith("/admin") ||
      !window.IntersectionObserver ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const groups = ".service-overview, .service-content-section, .program-list-group";
    const targets = document.querySelectorAll<HTMLElement>(`main section h2, ${groups}`);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("scroll-entrance-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05 },
    );

    for (const target of targets) {
      if (target.tagName === "H2" && target.parentElement?.closest(groups)) continue;
      if (target.getBoundingClientRect().top > window.innerHeight) observer.observe(target);
    }
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
