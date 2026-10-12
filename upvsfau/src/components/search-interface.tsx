"use client";

import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/src/components/data-states";
import { getPublicPrograms } from "@/src/lib/content";

export function SearchInterface() { const [query, setQuery] = useState(""); const normalized = query.trim().toLowerCase(); const results = getPublicPrograms().filter((program) => `${program.name} ${program.summary}`.toLowerCase().includes(normalized)); return <><div className="search-form"><label htmlFor="site-search">Search programs and services</label><div className="search-form-row"><input className="input" id="site-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try scholarship or assistance" /></div></div>{query && results.length > 0 ? <div className="program-list">{results.map((program) => <Link className="card program-row" href={`/services/scholarships/${program.slug}`} key={program.id}><div><h2>{program.name}</h2><p>{program.summary}</p></div><span aria-hidden="true">→</span></Link>)}</div> : <EmptyState title={query ? "No matching programs" : "Search the directory"} message={query ? "Try another search term or browse all services." : "Enter a term above to search the current static fixture content."} />}</>; }
