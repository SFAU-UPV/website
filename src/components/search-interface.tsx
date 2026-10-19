"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { EmptyState } from "@/src/components/data-states";
import type { Program } from "@/src/types/domain";
import { Button } from "@heroui/react";

export function SearchInterface({
  programs,
  initialQuery = "",
}: {
  programs: Program[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(
    () =>
      initialQuery ||
      (typeof window === "undefined"
        ? ""
        : (new URLSearchParams(window.location.search).get("q") ?? "")),
  );
  const normalized = query.trim().toLowerCase();
  const results = programs.filter((program) =>
    `${program.name} ${program.description ?? program.summary}`.toLowerCase().includes(normalized),
  );
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
      <p className="result-summary" id={resultId} aria-live="polite">
        {query
          ? `${results.length} ${results.length === 1 ? "result" : "results"}`
          : "Search results will appear here"}
      </p>
      {query && results.length > 0 ? (
        <div className="program-list">
          {results.map((program) => (
            <Link
              className="card program-row"
              href={`/services/scholarships/${program.slug}`}
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
      ) : (
        <EmptyState
          title={query ? "No matching programs" : "Search the directory"}
          message={
            query
              ? "Try another search term or browse all services."
              : "Enter a term above to search published SFAU program content."
          }
        />
      )}
    </>
  );
}
