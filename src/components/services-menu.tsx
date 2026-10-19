"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { services } from "@/src/types/domain";

export function ServicesMenu() {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function closeWhenOutside(event: PointerEvent) {
      if (detailsRef.current?.open && !detailsRef.current.contains(event.target as Node)) {
        detailsRef.current.open = false;
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && detailsRef.current?.open) {
        detailsRef.current.open = false;
        summaryRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", closeWhenOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeWhenOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <details ref={detailsRef} className="services-menu">
      <summary ref={summaryRef}>Services</summary>
      <div className="services-dropdown">
        {services.map((service) => (
          <Link href={`/services/${service.slug}`} key={service.slug}>
            {service.name}
          </Link>
        ))}
      </div>
    </details>
  );
}
