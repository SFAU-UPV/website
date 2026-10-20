"use client";

import Link from "next/link";
import { Accordion } from "@heroui/react";
import { getPrimaryCycle, resolveApplicationAvailability, type Program } from "@/src/types/domain";
import { StatusBadge } from "@/src/components/status-badge";

export function FeaturedOpportunities({ programs }: { programs: Program[] }) {
  return (
    <Accordion className="scholarship-accordions featured-opportunity-accordions" hideSeparator>
      {programs.map((program) => {
        const cycle = getPrimaryCycle(program);
        return (
          <Accordion.Item id={program.id} key={program.id}>
            <Accordion.Heading>
              <Accordion.Trigger className="scholarship-accordion-trigger">
                <span className="scholarship-accordion-main">
                  <strong>{program.name}</strong>
                  <span className="scholarship-accordion-meta">
                    <small>
                      {cycle?.endsOn ? `Deadline: ${cycle.endsOn}` : "Dates to be announced"}
                    </small>
                    <StatusBadge status={resolveApplicationAvailability(cycle)} />
                  </span>
                </span>
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body>
                <div className="scholarship-accordion-content">
                  {program.summary ? <p>{program.summary}</p> : null}
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
  );
}
