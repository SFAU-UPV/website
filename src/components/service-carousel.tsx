"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button, Card } from "@heroui/react";
import { services } from "@/src/types/domain";

const serviceImages: Record<string, string> = {
  "slas-online": "/services/slas-online.jpg",
  scholarships: "/services/scholarships.jpg",
  "other-financial-assistance": "/services/other-financial-assistance.jpg",
  "student-assistantship": "/services/student-assistantship.jpg",
  "share-loan": "/services/share-loan.jpg",
  "student-insurance": "/services/student-insurance.jpg",
};

function subscribeReducedMotion(onChange: () => void) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  preference.addEventListener("change", onChange);
  return () => preference.removeEventListener("change", onChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ServiceCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const lastIndexRef = useRef(0);
  const positionRef = useRef(0);
  const ignoreScrollUntilRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === "undefined" || !document.hidden,
  );
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(
    () => () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const getCardStep = useCallback(() => {
    const track = trackRef.current;
    const card = track?.querySelector<HTMLElement>(".service-slide");
    if (!track || !card) return null;
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
    return { track, step: card.offsetWidth + gap };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const details = getCardStep();
      if (details) details.track.scrollLeft = 0;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [getCardStep]);

  const scrollToPosition = useCallback(
    (position: number, behavior: ScrollBehavior = reducedMotion ? "auto" : "smooth") => {
      const details = getCardStep();
      if (!details) return;
      const nextIndex = ((position % services.length) + services.length) % services.length;
      const wraps = Math.abs(nextIndex - positionRef.current) > 1;
      lastIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      ignoreScrollUntilRef.current = behavior === "smooth" && !wraps ? performance.now() + 500 : 0;
      positionRef.current = nextIndex;
      details.track.scrollTo({
        left: nextIndex * details.step,
        behavior: wraps ? "instant" : behavior,
      });
    },
    [getCardStep, reducedMotion],
  );

  const scrollToService = useCallback(
    (index: number) => {
      scrollToPosition(index);
    },
    [scrollToPosition],
  );

  const move = useCallback(
    (step: number) => {
      if (!getCardStep()) return;
      scrollToPosition(positionRef.current + step);
    },
    [getCardStep, scrollToPosition],
  );

  const advanceAutomatically = useCallback(() => {
    move(1);
  }, [move]);

  useEffect(() => {
    if (paused || userPaused || reducedMotion || !inView || !pageVisible) return;
    const timer = window.setInterval(advanceAutomatically, 5000);
    return () => window.clearInterval(timer);
  }, [advanceAutomatically, paused, userPaused, reducedMotion, inView, pageVisible]);

  function updateActiveIndex() {
    if (performance.now() < ignoreScrollUntilRef.current) return;
    if (frameRef.current !== null) return;
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      const details = getCardStep();
      if (!details) return;
      const rawPosition = Math.round(details.track.scrollLeft / details.step);
      const nextPosition = Math.max(0, Math.min(services.length - 1, rawPosition));
      positionRef.current = nextPosition;
      const nextIndex = nextPosition;
      if (nextIndex !== lastIndexRef.current) {
        lastIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);
      }
    });
  }

  return (
    <div
      className="service-carousel"
      data-home-scroll="services"
      role="region"
      aria-roledescription="carousel"
      aria-label="OSA-SFAU services"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setPaused(false);
      }}
    >
      <div className="service-carousel-frame">
        <Button
          type="button"
          className="carousel-button"
          variant="outline"
          size="sm"
          onPress={() => move(-1)}
          aria-label="Previous services"
        >
          <span aria-hidden="true">←</span>
        </Button>
        <div
          ref={trackRef}
          className="service-track"
          onScroll={updateActiveIndex}
          tabIndex={0}
          aria-label="Scrollable services list"
        >
          {services.map((service, index) => (
            <Card
              className="service-slide"
              style={{ backgroundImage: `url("${serviceImages[service.slug]}")` }}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${services.length}: ${service.name}`}
              key={service.slug}
            >
              <Link className="service-slide-link" href={`/services/${service.slug}`}>
                <span className="service-slide-overlay">
                  <span className="service-slide-title typography typography--h3 typography--weight-bold">
                    {service.name}
                  </span>
                  <span className="service-slide-description">{service.description}</span>
                </span>
              </Link>
            </Card>
          ))}
        </div>
        <Button
          type="button"
          className="carousel-button"
          variant="outline"
          size="sm"
          onPress={() => move(1)}
          aria-label="Next services"
        >
          <span aria-hidden="true">→</span>
        </Button>
      </div>
      <div className="carousel-dots" aria-label="Jump to a service">
        {services.map((service, index) => (
          <button
            key={service.slug}
            type="button"
            className={`carousel-dot${index === activeIndex ? " active" : ""}`}
            aria-label={`Scroll to ${service.name}`}
            aria-pressed={index === activeIndex}
            onClick={() => scrollToService(index)}
          />
        ))}
      </div>
      {!reducedMotion && (
        <button
          className="carousel-pause"
          type="button"
          aria-pressed={userPaused}
          onClick={() => setUserPaused((value) => !value)}
        >
          {userPaused ? "Resume automatic slides" : "Pause automatic slides"}
        </button>
      )}
    </div>
  );
}
