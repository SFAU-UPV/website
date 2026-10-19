"use client";

import { Accordion } from "@heroui/react";
import Link from "next/link";
import { StatusBadge } from "@/src/components/status-badge";
import type { Program } from "@/src/types/domain";

export function AssistanceDirectory({ programs }: { programs: Pick<Program, "id" | "name" | "slug" | "benefits" | "degreePrograms">[] }) {
  if (!programs.length) return <div className="empty-state"><h3>No published assistance programs</h3><p>Published assistance programs will appear here when they are available.</p></div>;
  return <Accordion className="scholarship-accordions" hideSeparator>
    {programs.map((program, index) => <Accordion.Item id={program.id || `assistance-${index}`} key={program.id}>
      <Accordion.Heading>
        <Accordion.Trigger className="scholarship-accordion-trigger">
          <span className="scholarship-accordion-main"><strong>{program.name}</strong><span className="scholarship-accordion-meta"><small>Dates to be announced</small><StatusBadge status="unverified" /></span></span>
          <Accordion.Indicator />
        </Accordion.Trigger>
      </Accordion.Heading>
      <Accordion.Panel><Accordion.Body><div className="scholarship-accordion-content">{program.benefits?.length ? <section><h3>Benefits</h3><ul>{program.benefits.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}{program.degreePrograms?.length ? <section><h3>Applicable degree programs</h3><ul>{program.degreePrograms.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}{!program.benefits?.length && !program.degreePrograms?.length ? <p>Program details and application announcements will appear here when available.</p> : null}<Link className="button button-secondary" href={`/services/other-financial-assistance/${program.slug}`}>View full program details</Link></div></Accordion.Body></Accordion.Panel>
    </Accordion.Item>)}
  </Accordion>;
}
