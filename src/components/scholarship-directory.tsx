"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { scholarshipCategories } from "@/src/lib/constants";
import { FIXTURE_NOW, getProgramCategories, getPrimaryCycle, resolveApplicationAvailability, type ApplicationAvailability, type Program } from "@/src/types/domain";
import { StatusBadge } from "@/src/components/status-badge";
import { Button } from "@heroui/react";

type SortMode = "alpha" | "deadline";
const pageSize = 6;
const statuses: ApplicationAvailability[] = ["open", "upcoming", "closed", "suspended", "unverified"];

export function ScholarshipDirectory({ programs }: { programs: Program[] }) {
  const [category, setCategory] = useState(() => typeof window === "undefined" ? "all" : new URLSearchParams(window.location.search).get("category") ?? "all");
  const [query, setQuery] = useState(() => typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("q") ?? "");
  const [degree, setDegree] = useState(() => typeof window === "undefined" ? "all" : new URLSearchParams(window.location.search).get("degree") ?? "all");
  const [status, setStatus] = useState(() => typeof window === "undefined" ? "all" : new URLSearchParams(window.location.search).get("status") ?? "all");
  const [sort, setSort] = useState<SortMode>(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("sort") === "deadline" ? "deadline" : "alpha");
  const [page, setPage] = useState(1);
  const [today, setToday] = useState(FIXTURE_NOW);

  useEffect(() => { const timer = window.setTimeout(() => setToday(new Date()), 0); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { const params = new URLSearchParams(); if (category !== "all") params.set("category", category); if (query) params.set("q", query); if (degree !== "all") params.set("degree", degree); if (status !== "all") params.set("status", status); if (sort !== "alpha") params.set("sort", sort); window.history.replaceState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`); }, [category, query, degree, status, sort]);

  const degrees = useMemo(() => Array.from(new Set(programs.flatMap((program) => program.degreePrograms ?? []))).sort(), [programs]);
  const filtered = useMemo(() => programs.filter((program) => {
    const availability = resolveApplicationAvailability(getPrimaryCycle(program), today);
    const matchesCategory = category === "all" || getProgramCategories(program).includes(category as never);
    const matchesQuery = !query || `${program.name} ${program.summary}`.toLowerCase().includes(query.toLowerCase());
    const matchesDegree = degree === "all" || program.degreePrograms?.includes(degree);
    const matchesStatus = status === "all" || availability === status;
    return matchesCategory && matchesQuery && matchesDegree && matchesStatus;
  }).sort((a, b) => sort === "alpha" ? a.name.localeCompare(b.name) : (getPrimaryCycle(a)?.endsOn ?? "9999-12-31").localeCompare(getPrimaryCycle(b)?.endsOn ?? "9999-12-31")), [programs, category, query, degree, status, sort, today]);
  const visible = filtered.slice(0, page * pageSize);

  function clearFilters() { setPage(1); setCategory("all"); setQuery(""); setDegree("all"); setStatus("all"); setSort("alpha"); }
  function chooseCategory(value: string) { setPage(1); setCategory(value); }
  function chooseQuery(value: string) { setPage(1); setQuery(value); }
  function chooseDegree(value: string) { setPage(1); setDegree(value); }
  function chooseStatus(value: string) { setPage(1); setStatus(value); }
  function chooseSort(value: SortMode) { setPage(1); setSort(value); }

  return <div data-testid="scholarship-directory">
    <div className="directory-tabs" role="group" aria-label="Scholarship categories">
      <button className={category === "all" ? "active" : ""} aria-pressed={category === "all"} type="button" onClick={() => chooseCategory("all")}>All</button>
      {scholarshipCategories.map((item) => <button className={category === item.slug ? "active" : ""} aria-pressed={category === item.slug} type="button" key={item.slug} onClick={() => chooseCategory(item.slug)}>{item.label}</button>)}
    </div>
    <fieldset className="filters directory-filters"><legend className="sr-only">Filter and sort scholarship programs</legend>
      <label className="filter-search"><span>Search by name</span><input className="input" value={query} onChange={(event) => chooseQuery(event.target.value)} placeholder="Search scholarships" /></label>
      <label className="filter-select"><span>Degree program</span><select className="select" value={degree} onChange={(event) => chooseDegree(event.target.value)}><option value="all">All degree programs</option>{degrees.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
      <label className="filter-select"><span>Application status</span><select className="select" value={status} onChange={(event) => chooseStatus(event.target.value)}><option value="all">All statuses</option>{statuses.map((item) => <option value={item} key={item}>{item === "unverified" ? "Check official source" : item[0].toUpperCase() + item.slice(1)}</option>)}</select></label>
      <label className="filter-select"><span>Sort by</span><select className="select" value={sort} onChange={(event) => chooseSort(event.target.value as SortMode)}><option value="alpha">Alphabetical</option><option value="deadline">Deadline</option></select></label>
      <Button className="clear-filters" type="button" variant="outline" size="md" onPress={clearFilters}>Clear filters</Button>
    </fieldset>
    <div className="result-bar" aria-live="polite"><strong>{filtered.length} {filtered.length === 1 ? "program" : "programs"}</strong><span>Closed and unverified programs remain discoverable.</span></div>
    {visible.length ? <div className="program-list">{visible.map((program) => { const cycle = getPrimaryCycle(program); const availability = resolveApplicationAvailability(cycle, today); return <Link className="card program-row" href={`/services/scholarships/${program.slug}`} key={program.id} data-testid={`program-row-${program.id}`}><div><p className="fixture-label">STATIC MOCK FIXTURE</p><h2>{program.name}</h2><p>{getProgramCategories(program).join(" · ")} · {program.summary}</p><small>{cycle?.endsOn ? `Deadline: ${cycle.endsOn}` : "Deadline: Not verified"}</small></div><div className="program-meta"><StatusBadge status={availability} /><span aria-hidden="true">→</span></div></Link>; })}</div> : <div className="empty-state"><h2>No matching programs</h2><p>Try clearing a filter or checking the official SFAU announcement.</p></div>}
    {visible.length < filtered.length && <button className="button button-secondary load-more" type="button" onClick={() => setPage((value) => value + 1)}>Load more programs</button>}
  </div>;
}
