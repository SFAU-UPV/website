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

const repeatedServices = [...services, ...services, ...services];
const middleStart = services.length;

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
  const positionRef = useRef(middleStart);
  const ignoreScrollUntilRef = useRef(0);
  const loopResetTimerRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);

  useEffect(
    () => () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      if (loopResetTimerRef.current !== null) window.clearTimeout(loopResetTimerRef.current);
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
      if (details) details.track.scrollLeft = middleStart * details.step;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [getCardStep]);

  const scrollToPosition = useCallback(
    (position: number, behavior: ScrollBehavior = reducedMotion ? "auto" : "smooth") => {
      const details = getCardStep();
      if (!details) return;
      const isForwardBoundary = position >= middleStart * 2;
      const isBackwardBoundary = position < middleStart;
      let normalizedPosition = position;
      while (normalizedPosition >= middleStart * 2) normalizedPosition -= services.length;
      while (normalizedPosition < middleStart) normalizedPosition += services.length;
      const nextIndex = (normalizedPosition - middleStart) % services.length;
      lastIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      ignoreScrollUntilRef.current = behavior === "smooth" ? performance.now() + 500 : 0;

      if (isForwardBoundary || isBackwardBoundary) {
        const physicalPosition = position;
        positionRef.current = physicalPosition;
        details.track.scrollTo({ left: physicalPosition * details.step, behavior });
        if (loopResetTimerRef.current !== null) window.clearTimeout(loopResetTimerRef.current);
        loopResetTimerRef.current = window.setTimeout(
          () => {
            const track = trackRef.current;
            if (!track) return;
            const resetPosition = isForwardBoundary
              ? physicalPosition - services.length
              : physicalPosition + services.length;
            track.scrollLeft = resetPosition * details.step;
            positionRef.current = resetPosition;
            loopResetTimerRef.current = null;
          },
          behavior === "smooth" ? 700 : 0,
        );
        return;
      }

      positionRef.current = normalizedPosition;
      details.track.scrollTo({ left: normalizedPosition * details.step, behavior });
    },
    [getCardStep, reducedMotion],
  );

  const scrollToService = useCallback(
    (index: number) => {
      scrollToPosition(middleStart + index);
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
    if (paused || userPaused || reducedMotion) return;
    const timer = window.setInterval(advanceAutomatically, 3000);
    return () => window.clearInterval(timer);
  }, [advanceAutomatically, paused, userPaused, reducedMotion]);

  function updateActiveIndex() {
    if (performance.now() < ignoreScrollUntilRef.current) return;
    if (frameRef.current !== null) return;
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      const details = getCardStep();
      if (!details) return;
      const rawPosition = Math.round(details.track.scrollLeft / details.step);
      const nextPosition = Math.max(0, Math.min(repeatedServices.length - 1, rawPosition));
      positionRef.current = nextPosition;
      const nextIndex =
        (((nextPosition - middleStart) % services.length) + services.length) % services.length;
      if (nextIndex !== lastIndexRef.current) {
        lastIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);
      }
    });
  }

  return (
    <div
      className="service-carousel"
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
          {repeatedServices.map((service, index) => (
            <Card
              className="service-slide"
              style={{ backgroundImage: `url("${serviceImages[service.slug]}")` }}
              role="group"
              aria-roledescription="slide"
              aria-label={`${(index % services.length) + 1} of ${services.length}: ${service.name}`}
              key={`${service.slug}-${index}`}
            >
              <div className="service-slide-index">0{(index % services.length) + 1}</div>
              <div className="service-slide-overlay">
                <Link
                  className="service-slide-title typography typography--h3 typography--weight-bold"
                  href={
                    service.slug === "scholarships"
                      ? "/services/scholarships"
                      : `/services/${service.slug}`
                  }
                >
                  {service.name}
                </Link>
              </div>
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
