"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { EmptyState } from "@/src/components/data-states";
import { services, type Program } from "@/src/types/domain";
import { Button } from "@heroui/react";

export function SearchInterface({
  programs,
  initialQuery = "",
}: {
  programs: Program[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const normalized = query.trim().toLowerCase();
  const hasQuery = normalized.length > 0;
  const serviceResults = hasQuery
    ? services.filter((service) =>
        `${service.name} ${service.description}`.toLowerCase().includes(normalized),
      )
    : [];
  const programResults = hasQuery
    ? programs.filter((program) =>
        `${program.name} ${program.description ?? program.summary}`.toLowerCase().includes(normalized),
      )
    : [];
  const resultCount = serviceResults.length + programResults.length;
  const resultId = useId();

  return (
    <>
      <div className="search-form">
        <label htmlFor="site-search">Search programs and services</label>
        <div className="search-form-row">
          <input
            className="input"
            id="site-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try scholarship or assistance"
            aria-describedby={resultId}
          />
          {query && (
            <Button type="button" variant="outline" size="md" onPress={() => setQuery("")}>
              Clear search
            </Button>
          )}
        </div>
      </div>
      <p className={hasQuery ? "result-summary" : "sr-only"} id={resultId} aria-live="polite">
        {hasQuery
          ? `${resultCount} ${resultCount === 1 ? "result" : "results"}`
          : "Enter a term to search SFAU services and published programs."}
      </p>
      {hasQuery && resultCount > 0 ? (
        <div className="program-list">
          {serviceResults.map((service) => (
            <Link className="card program-row" href={`/services/${service.slug}`} key={service.slug}>
              <div>
                <h2>{service.name}</h2>
                <p>{service.description}</p>
              </div>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
          {programResults.map((program) => (
            <Link
              className="card program-row"
              href={
                program.serviceSlug === "scholarships" ||
                program.serviceSlug === "other-financial-assistance"
                  ? `/services/${program.serviceSlug}/${program.slug}`
                  : `/services/${program.serviceSlug}`
              }
              key={program.id}
            >
              <div>
                <h2>{program.name}</h2>
                {program.summary ? <p>{program.summary}</p> : null}
              </div>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      ) : hasQuery ? (
        <EmptyState
          title="No matching information"
          message="Try another search term or browse all services."
        />
      ) : null}
    </>
  );
}
