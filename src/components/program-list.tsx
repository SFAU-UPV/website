"use client";

import { ProgramDetailsLink } from "@/src/components/program-details-link";
import { StatusBadge } from "@/src/components/status-badge";
import { formatProgramTitle } from "@/src/lib/format";
import { getPrimaryCycle, resolveApplicationAvailability, type Program } from "@/src/types/domain";

export function ProgramList({ programs, today }: { programs: Program[]; today?: Date }) {
  return (
    <ul className="program-list-group">
      {programs.map((program) => {
        const cycle = getPrimaryCycle(program);
        return (
          <li key={program.id}>
            <ProgramDetailsLink program={program} className="program-list-row">
              <span className="program-list-copy">
                <strong>{formatProgramTitle(program.name)}</strong>
                <span className="program-list-meta">
                  <small>
                    {cycle?.endsOn ? `Deadline: ${cycle.endsOn}` : "Dates to be announced"}
                  </small>
                  <StatusBadge status={resolveApplicationAvailability(cycle, today)} />
                </span>
              </span>
              <span className="program-list-action">View details</span>
            </ProgramDetailsLink>
          </li>
        );
      })}
    </ul>
  );
}
