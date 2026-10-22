"use client";

import { useEffect } from "react";

export function HomeScrollMotion() {
  useEffect(() => {
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    const targets = document.querySelectorAll<HTMLElement>("[data-home-scroll]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-home-scroll-visible", "true");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -25% 0px" },
    );

    for (const target of targets) {
      if (target.getBoundingClientRect().top > window.innerHeight * 0.65) {
        observer.observe(target);
      }
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
