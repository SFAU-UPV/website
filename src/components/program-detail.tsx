import { Breadcrumbs } from "@/src/components/breadcrumbs";
import {
  canApply,
  getPrimaryCycle,
  resolveApplicationAvailability,
  type Program,
} from "@/src/types/domain";
import { formatProgramTitle } from "@/src/lib/format";

const availabilityCopy = {
  upcoming: "This opportunity is not open yet. Check the opening date.",
  closed: "This application cycle is closed. The program remains listed for reference.",
  suspended: "This opportunity is temporarily unavailable.",
  unverified: "Application details are not currently available.",
  open: "Applications are currently available. Use the application link below to continue.",
};

function ListSection({ id, title, items }: { id: string; title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <section className="prose-section" id={id}>
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function ProgramDetail({
  program,
  breadcrumbs,
}: {
  program: Program;
  breadcrumbs: { label: string; href?: string }[];
}) {
  const cycle = getPrimaryCycle(program);
  const availability = resolveApplicationAvailability(cycle);
  const applyEnabled = canApply(program, cycle);
  const summary = program.summary?.trim();
  const description = program.description?.trim();
  const overview = description || summary;
  return (
    <>
      <section className="page-intro">
        <div className="container">
          <h1>{formatProgramTitle(program.name)}</h1>
        </div>
      </section>
      <Breadcrumbs items={breadcrumbs} />
      <section className="section">
        <div className="container detail-layout">
          <article>
            <div className={`availability-panel availability-${availability}`}>
              <strong>
                {availability === "open"
                  ? "Applications available"
                  : availability === "upcoming"
                    ? "Upcoming application"
                    : availability === "closed"
                      ? "Applications closed"
                      : availability === "suspended"
                        ? "Temporarily unavailable"
                        : "Currently unavailable"}
              </strong>
              <p>{availabilityCopy[availability]}</p>
              {applyEnabled && cycle?.externalApplicationUrl ? (
                <a
                  className="button button-primary"
                  href={cycle.externalApplicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply Now <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <span className="availability-action">Application link unavailable</span>
              )}
            </div>
            {overview ? (
              <section className="prose-section" id="overview">
                <h2>Overview</h2>
                {summary && description && summary !== description ? <p>{summary}</p> : null}
                <p>{overview}</p>
              </section>
            ) : null}
            <ListSection id="eligibility" title="Eligibility" items={program.eligibility} />
            <ListSection id="requirements" title="Requirements" items={program.requirements} />
            <ListSection id="benefits" title="Benefits" items={program.benefits} />
            {program.degreePrograms?.length ? (
              <section className="prose-section" id="degrees">
                <h2>Applicable degree programs</h2>
                <ul>
                  {program.degreePrograms.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            <ListSection
              id="application"
              title="Application process"
              items={program.applicationProcess}
            />
            {cycle?.startsOn || cycle?.endsOn ? (
              <section className="prose-section" id="dates">
                <h2>Application dates</h2>
                <dl className="date-grid">
                  {cycle.startsOn ? (
                    <>
                      <dt>Opens</dt>
                      <dd>{cycle.startsOn}</dd>
                    </>
                  ) : null}
                  {cycle.endsOn ? (
                    <>
                      <dt>Closes</dt>
                      <dd>{cycle.endsOn}</dd>
                    </>
                  ) : null}
                </dl>
              </section>
            ) : null}
            {program.contact?.length || program.officialSourceUrl ? (
              <section className="prose-section" id="contact">
                <h2>Contact and official links</h2>
                {program.contact?.map((item) => (
                  <p key={item.label}>
                    <strong>{item.label}</strong>
                    <br />
                    {item.href ? (
                      <a className="text-link" href={item.href}>
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </p>
                ))}
                {program.officialSourceUrl ? (
                  <p>
                    <a
                      className="text-link"
                      href={program.officialSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit official source ↗
                    </a>
                  </p>
                ) : null}
              </section>
            ) : null}
            {cycle?.linkType === "google-form" ? (
              <p className="source-note">The application destination is a Google Form.</p>
            ) : cycle?.linkType === "official-portal" ? (
              <p className="source-note">
                The application destination is recorded as an official external portal.
              </p>
            ) : null}
          </article>
        </div>
      </section>
    </>
  );
}
