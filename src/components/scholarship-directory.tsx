"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { scholarshipCategories } from "@/src/lib/constants";
import { FIXTURE_NOW, getProgramCategories, getPrimaryCycle, undergraduateDegreePrograms, resolveApplicationAvailability, type ApplicationAvailability, type Program } from "@/src/types/domain";
import { StatusBadge } from "@/src/components/status-badge";
import { Button } from "@heroui/react";
import { Accordion } from "@heroui/react";

type SortMode = "alpha" | "deadline";
const pageSize = 6;
const statuses: ApplicationAvailability[] = ["open", "upcoming", "closed", "suspended", "unverified"];

export function ScholarshipDirectory({ programs }: { programs: Program[] }) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [degree, setDegree] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<SortMode>("alpha");
  const [page, setPage] = useState(1);
  const [today, setToday] = useState(FIXTURE_NOW);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCategory(params.get("category") ?? "all");
    setQuery(params.get("q") ?? "");
    setDegree(params.get("degree") ?? "all");
    setStatus(params.get("status") ?? "all");
    setSort(params.get("sort") === "deadline" ? "deadline" : "alpha");
    setHydrated(true);
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => setToday(new Date()), 0); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { if (!hydrated) return; const params = new URLSearchParams(); if (category !== "all") params.set("category", category); if (query) params.set("q", query); if (degree !== "all") params.set("degree", degree); if (status !== "all") params.set("status", status); if (sort !== "alpha") params.set("sort", sort); window.history.replaceState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`); }, [category, query, degree, status, sort, hydrated]);

  const degrees = useMemo(() => [...undergraduateDegreePrograms].sort(), []);
  const filtered = useMemo(() => programs.filter((program) => {
    const availability = resolveApplicationAvailability(getPrimaryCycle(program), today);
    const matchesCategory = category === "all" || getProgramCategories(program).some((item) => String(item).trim().toLowerCase() === category.trim().toLowerCase());
    const matchesQuery = !query || `${program.name} ${program.description ?? program.summary}`.toLowerCase().includes(query.toLowerCase());
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
    <div className="result-bar" aria-live="polite"><strong>{filtered.length} {filtered.length === 1 ? "program" : "programs"}</strong></div>    {visible.length ? <Accordion className="scholarship-accordions" hideSeparator>{visible.map((program) => { const cycle = getPrimaryCycle(program); const availability = resolveApplicationAvailability(cycle, today); return <Accordion.Item id={program.id} key={program.id}><Accordion.Heading><Accordion.Trigger className="scholarship-accordion-trigger"><span className="scholarship-accordion-main"><strong>{program.name}</strong><span className="scholarship-accordion-meta"><small>{cycle?.endsOn ? `Deadline: ${cycle.endsOn}` : "Dates to be announced"}</small><StatusBadge status={availability} /></span></span><Accordion.Indicator /></Accordion.Trigger></Accordion.Heading><Accordion.Panel><Accordion.Body><div className="scholarship-accordion-content">{program.benefits?.length ? <section><h3>Benefits</h3><ul>{program.benefits.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}{program.degreePrograms?.length ? <section><h3>Applicable degree programs</h3><ul>{program.degreePrograms.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}<Link className="button button-secondary" href={`/services/scholarships/${program.slug}`}>View full program details</Link></div></Accordion.Body></Accordion.Panel></Accordion.Item>; })}</Accordion> : <div className="empty-state"><h2>No published programs</h2><p>Published SFAU scholarship content will appear here after it is loaded into Neon.</p></div>}
    {visible.length < filtered.length && <button className="button button-secondary load-more" type="button" onClick={() => setPage((value) => value + 1)}>Load more programs</button>}
  </div>;
}
