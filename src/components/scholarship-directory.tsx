"use client";

import { ProgramList } from "@/src/components/program-list";
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

import { Button, Input, ListBox, Select, Tabs } from "@heroui/react";

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
  const [sort, setSort] = useState<SortMode>(
    first(initialFilters.sort) === "deadline" ? "deadline" : "alpha",
  );
  const [page, setPage] = useState(1);
  const [today, setToday] = useState(FIXTURE_NOW);
  const [filtersOpen, setFiltersOpen] = useState(false);
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
      <Tabs
        className="directory-tabs"
        aria-label="Scholarship categories"
        selectedKey={category}
        onSelectionChange={(key) => {
          if (typeof key === "string") chooseCategory(key);
        }}
      >
        <Tabs.List>
          <Tabs.Tab id="all">All</Tabs.Tab>
          {scholarshipCategories.map((item) => (
            <Tabs.Tab id={item.slug} key={item.slug}>
              {item.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      <fieldset className="filters directory-filters">
        <legend className="sr-only">Filter and sort scholarship programs</legend>
        <div className="directory-filter-mobile-row">
          <label className="filter-search">
            <span>Search by name</span>
            <Input
              className="input"
              value={query}
              onChange={(event) => chooseQuery(event.target.value)}
              placeholder="Search scholarships"
            />
          </label>
          <button
            className="mobile-filters-toggle"
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="directory-filter-options"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 5h16l-6.25 7.1v5.2l-3.5 1.9v-7.1L4 5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Filters
          </button>
        </div>
        <div
          className={`directory-filter-options${filtersOpen ? " is-open" : ""}`}
          id="directory-filter-options"
        >
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
        </div>
      </fieldset>
      <div className="result-bar" aria-live="polite">
        <strong>
          {filtered.length} {filtered.length === 1 ? "program" : "programs"}
        </strong>
      </div>{" "}
      {visible.length ? (
        <ProgramList programs={visible} today={today} />
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
