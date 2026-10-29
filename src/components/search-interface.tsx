"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Button, Input, Tabs } from "@heroui/react";
import { EmptyState } from "@/src/components/data-states";
import { ProgramDetailsLink } from "@/src/components/program-details-link";
import { formatProgramTitle } from "@/src/lib/format";
import { services, type Program } from "@/src/types/domain";

type ResultType = "all" | "services" | "programs";

export function SearchInterface({
  programs,
  initialQuery = "",
}: {
  programs: Program[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [resultType, setResultType] = useState<ResultType>("all");
  const normalized = query.trim().toLowerCase();
  const hasQuery = normalized.length > 0;
  const serviceResults = hasQuery
    ? services.filter((service) =>
        `${service.name} ${service.description}`.toLowerCase().includes(normalized),
      )
    : [];
  const programResults = hasQuery
    ? programs.filter((program) =>
        `${program.name} ${program.description ?? program.summary}`
          .toLowerCase()
          .includes(normalized),
      )
    : [];
  const visibleServices = resultType === "programs" ? [] : serviceResults;
  const visiblePrograms = resultType === "services" ? [] : programResults;
  const resultCount = visibleServices.length + visiblePrograms.length;
  const resultId = useId();

  const serviceRows = visibleServices.map((service) => (
    <li key={service.slug}>
      <Link className="search-result-item" href={`/services/${service.slug}`}>
        <span>
          <strong>{service.name}</strong>
          <span>{service.description}</span>
        </span>
      </Link>
    </li>
  ));
  const programRows = visiblePrograms.map((program) => (
    <li key={program.id}>
      {program.serviceSlug === "scholarships" ||
      program.serviceSlug === "other-financial-assistance" ? (
        <ProgramDetailsLink program={program} className="search-result-item">
          <span>
            <strong>{formatProgramTitle(program.name)}</strong>
            {program.summary ? <span>{program.summary}</span> : null}
          </span>
        </ProgramDetailsLink>
      ) : (
        <Link className="search-result-item" href={`/services/${program.serviceSlug}`}>
          <span>
            <strong>{formatProgramTitle(program.name)}</strong>
            {program.summary ? <span>{program.summary}</span> : null}
          </span>
        </Link>
      )}
    </li>
  ));

  return (
    <>
      <Tabs
        className="directory-tabs search-type-tabs"
        aria-label="Search result type"
        selectedKey={resultType}
        onSelectionChange={(key) => {
          if (key === "all" || key === "services" || key === "programs") {
            setResultType(key);
          }
        }}
      >
        <Tabs.List>
          <Tabs.Tab id="all">
            All{hasQuery ? ` (${serviceResults.length + programResults.length})` : ""}
          </Tabs.Tab>
          <Tabs.Tab id="services">Services{hasQuery ? ` (${serviceResults.length})` : ""}</Tabs.Tab>
          <Tabs.Tab id="programs">Programs{hasQuery ? ` (${programResults.length})` : ""}</Tabs.Tab>
        </Tabs.List>
      </Tabs>
      <fieldset className="filters directory-filters search-filters">
        <legend className="sr-only">Search SFAU information</legend>
        <label className="filter-search">
          <span>Search by name</span>
          <Input
            className="input"
            id="site-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search services and programs"
            aria-describedby={resultId}
          />
        </label>
        {query ? (
          <Button
            className="clear-filters"
            type="button"
            variant="primary"
            size="md"
            onPress={() => setQuery("")}
          >
            Clear search
          </Button>
        ) : null}
      </fieldset>
      <div className="result-bar" aria-live="polite" id={resultId}>
        {hasQuery ? (
          <strong>
            {resultCount} {resultCount === 1 ? "result" : "results"}
          </strong>
        ) : (
          <span>Search published programs and student services.</span>
        )}
      </div>
      {hasQuery && resultCount > 0 ? (
        <div className="search-results">
          {resultType === "all" ? (
            <>
              {serviceRows.length > 0 ? (
                <section
                  className="search-result-section"
                  aria-labelledby="search-services-heading"
                >
                  <h2 id="search-services-heading">Services</h2>
                  <ul className="search-result-list">{serviceRows}</ul>
                </section>
              ) : null}
              {programRows.length > 0 ? (
                <section
                  className="search-result-section"
                  aria-labelledby="search-programs-heading"
                >
                  <h2 id="search-programs-heading">Programs</h2>
                  <ul className="search-result-list">{programRows}</ul>
                </section>
              ) : null}
            </>
          ) : (
            <ul className="search-result-list">
              {resultType === "services" ? serviceRows : programRows}
            </ul>
          )}
        </div>
      ) : hasQuery ? (
        <EmptyState
          title="No matching information"
          message="Try another search term or choose another result type."
        />
      ) : null}
    </>
  );
}
