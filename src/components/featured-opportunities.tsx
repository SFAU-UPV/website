"use client";

import Link from "next/link";
import { getPrimaryCycle, resolveApplicationAvailability, type Program } from "@/src/types/domain";
import { formatProgramTitle } from "@/src/lib/format";
import { StatusBadge } from "@/src/components/status-badge";

export function FeaturedOpportunities({ programs }: { programs: Program[] }) {
  return (
    <div className="featured-opportunity-list">
      {programs.map((program) => {
        const cycle = getPrimaryCycle(program);
        return (
          <Link className="featured-opportunity-row" href={`/services/scholarships/${program.slug}`} key={program.id}>
            <span className="featured-opportunity-copy">
              <strong>{formatProgramTitle(program.name)}</strong>
              {program.summary ? <span>{program.summary}</span> : null}
            </span>
            <span className="featured-opportunity-status">
              <small>{cycle?.endsOn ? `Deadline: ${cycle.endsOn}` : "Dates to be announced"}</small>
              <StatusBadge status={resolveApplicationAvailability(cycle)} />
            </span>
            <span className="featured-opportunity-link">View details</span>
          </Link>
        );
      })}
    </div>
  );
}
