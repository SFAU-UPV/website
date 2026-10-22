"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { scholarshipCategories } from "@/src/lib/constants";
import {
  FIXTURE_NOW,
  getProgramCategories,
  getPrimaryCycle,
  undergraduateDegreePrograms,
  resolveApplicationAvailability,
  type ApplicationAvailability,
  type Program,
} from "@/src/types/domain";
import { StatusBadge } from "@/src/components/status-badge";
import { Accordion, Button, Input, ListBox, Select } from "@heroui/react";

type SortMode = "alpha" | "deadline";
const pageSize = 6;
const statuses: ApplicationAvailability[] = [
  "open",
  "upcoming",
  "closed",
  "suspended",
  "unverified",
];

type InitialFilters = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function ScholarshipDirectory({
  programs,
  initialFilters,
}: {
  programs: Program[];
  initialFilters: InitialFilters;
}) {
  const [category, setCategory] = useState(first(initialFilters.category) ?? "all");
  const [query, setQuery] = useState(first(initialFilters.q) ?? "");
  const [degree, setDegree] = useState(first(initialFilters.degree) ?? "all");
  const [status, setStatus] = useState(first(initialFilters.status) ?? "all");
  const [sort, setSort] = useState<SortMode>(first(initialFilters.sort) === "deadline" ? "deadline" : "alpha");
  const [page, setPage] = useState(1);
  const [today, setToday] = useState(FIXTURE_NOW);
  useEffect(() => {
    const timer = window.setTimeout(() => setToday(new Date()), 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (query) params.set("q", query);
    if (degree !== "all") params.set("degree", degree);
    if (status !== "all") params.set("status", status);
    if (sort !== "alpha") params.set("sort", sort);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${params.size ? `?${params}` : ""}`,
    );
  }, [category, query, degree, status, sort]);

  const degrees = useMemo(() => [...undergraduateDegreePrograms].sort(), []);
  const filtered = useMemo(
    () =>
      programs
        .filter((program) => {
          const availability = resolveApplicationAvailability(getPrimaryCycle(program), today);
          const matchesCategory =
            category === "all" ||
            getProgramCategories(program).some(
              (item) => String(item).trim().toLowerCase() === category.trim().toLowerCase(),
            );
          const matchesQuery =
            !query ||
            `${program.name} ${program.description ?? program.summary}`
              .toLowerCase()
              .includes(query.toLowerCase());
          const matchesDegree = degree === "all" || program.degreePrograms?.includes(degree);
          const matchesStatus = status === "all" || availability === status;
          return matchesCategory && matchesQuery && matchesDegree && matchesStatus;
        })
        .sort((a, b) =>
          sort === "alpha"
            ? a.name.localeCompare(b.name)
            : (getPrimaryCycle(a)?.endsOn ?? "9999-12-31").localeCompare(
                getPrimaryCycle(b)?.endsOn ?? "9999-12-31",
              ),
        ),
    [programs, category, query, degree, status, sort, today],
  );
  const visible = filtered.slice(0, page * pageSize);

  function clearFilters() {
    setPage(1);
    setCategory("all");
    setQuery("");
    setDegree("all");
    setStatus("all");
    setSort("alpha");
  }
  function chooseCategory(value: string) {
    setPage(1);
    setCategory(value);
  }
  function chooseQuery(value: string) {
    setPage(1);
    setQuery(value);
  }
  function chooseDegree(value: string) {
    setPage(1);
    setDegree(value);
  }
  function chooseStatus(value: string) {
    setPage(1);
    setStatus(value);
  }
  function chooseSort(value: SortMode) {
    setPage(1);
    setSort(value);
  }

  return (
    <div data-testid="scholarship-directory">
      <div className="directory-tabs" role="group" aria-label="Scholarship categories">
        <button
          className={category === "all" ? "active" : ""}
          aria-pressed={category === "all"}
          type="button"
          onClick={() => chooseCategory("all")}
        >
          All
        </button>
        {scholarshipCategories.map((item) => (
          <button
            className={category === item.slug ? "active" : ""}
            aria-pressed={category === item.slug}
            type="button"
            key={item.slug}
            onClick={() => chooseCategory(item.slug)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <fieldset className="filters directory-filters">
        <legend className="sr-only">Filter and sort scholarship programs</legend>
          <label className="filter-search">
          <span>Search by name</span>
            <Input
            className="input"
            value={query}
            onChange={(event) => chooseQuery(event.target.value)}
            placeholder="Search scholarships"
          />
        </label>
        <label className="filter-select">
          <span>Degree program</span>
            <Select
              aria-label="Degree program"
              className="filter-control"
              selectedKey={degree}
              onSelectionChange={(key) => chooseDegree(String(key))}
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="all">All degree programs</ListBox.Item>
                  {degrees.map((item) => (
                    <ListBox.Item id={item} key={item}>
                      {item}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
        </label>
        <label className="filter-select">
          <span>Application status</span>
            <Select
              aria-label="Application status"
              className="filter-control"
              selectedKey={status}
              onSelectionChange={(key) => chooseStatus(String(key))}
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="all">All statuses</ListBox.Item>
                  {statuses.map((item) => (
                    <ListBox.Item id={item} key={item}>
                      {item === "unverified"
                        ? "Check official source"
                        : item[0].toUpperCase() + item.slice(1)}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
        </label>
        <label className="filter-select">
          <span>Sort by</span>
            <Select
              aria-label="Sort by"
              className="filter-control"
              selectedKey={sort}
              onSelectionChange={(key) => chooseSort(String(key) as SortMode)}
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="alpha">Alphabetical</ListBox.Item>
                  <ListBox.Item id="deadline">Deadline</ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
        </label>
        <Button
          className="clear-filters"
          type="button"
          variant="primary"
          size="md"
          onPress={clearFilters}
        >
          Clear filters
        </Button>
      </fieldset>
      <div className="result-bar" aria-live="polite">
        <strong>
          {filtered.length} {filtered.length === 1 ? "program" : "programs"}
        </strong>
      </div>{" "}
      {visible.length ? (
        <Accordion className="scholarship-accordions" hideSeparator>
          {visible.map((program) => {
            const cycle = getPrimaryCycle(program);
            const availability = resolveApplicationAvailability(cycle, today);
            return (
              <Accordion.Item id={program.id} key={program.id}>
                <Accordion.Heading level={2}>
                  <Accordion.Trigger className="scholarship-accordion-trigger">
                    <span className="scholarship-accordion-main">
                      <strong>{program.name}</strong>
                      <span className="scholarship-accordion-meta">
                        <small>
                          {cycle?.endsOn ? `Deadline: ${cycle.endsOn}` : "Dates to be announced"}
                        </small>
                        <StatusBadge status={availability} />
                      </span>
                    </span>
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body>
                    <div className="scholarship-accordion-content">
                      {program.benefits?.length ? (
                        <section>
                          <h3>Benefits</h3>
                          <ul>
                            {program.benefits.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </section>
                      ) : null}
                      {program.degreePrograms?.length ? (
                        <section>
                          <h3>Applicable degree programs</h3>
                          <ul>
                            {program.degreePrograms.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </section>
                      ) : null}
                      <Link
                        className="button button-primary"
                        href={`/services/scholarships/${program.slug}`}
                      >
                        View Details
                      </Link>
                    </div>
                  </Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      ) : programs.length ? (
        <div className="empty-state">
          <h2>No matching scholarships</h2>
          <p>Clear the filters to see all published scholarship programs.</p>
          <Button type="button" variant="secondary" onPress={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="empty-state">
          <h2>No published programs</h2>
          <p>Verified scholarship information will appear here when SFAU publishes it.</p>
        </div>
      )}
      {visible.length < filtered.length && (
        <button
          className="button button-secondary load-more"
          type="button"
          onClick={() => setPage((value) => value + 1)}
        >
          Load more programs
        </button>
      )}
    </div>
  );
}
