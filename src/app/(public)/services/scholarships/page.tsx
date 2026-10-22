import { Breadcrumbs } from "@/src/components/breadcrumbs";
import { getPublicProgramsResult } from "@/src/lib/content";
import { ErrorState } from "@/src/components/data-states";
import { ScholarshipDirectory } from "@/src/components/scholarship-directory";

export const instant = false;

const otherAssistanceNames = new Set([
  "upv adopt-a-student program",
  "upv silak-silab foundation wellness fund grant",
  "lingap iskolar ng bayan",
]);

export default async function ScholarshipsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const initialFilters = await searchParams;
  const result = await getPublicProgramsResult();
  const programs = result.data.filter(
    (program) =>
      program.serviceSlug === "scholarships" &&
      !otherAssistanceNames.has(program.name.trim().toLowerCase()),
  );
  return (
    <>
      <section className="page-intro">
        <div className="container">
          <h1>Scholarship Programs</h1>
          <p>
            Browse published opportunities by category, degree program, application status, or
            deadline. Application availability is shown only after SFAU verification.
          </p>
        </div>
      </section>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: "Scholarships" },
        ]}
      />
      <section className="section">
        <div className="container">
          {result.status === "error" ? (
            <ErrorState />
          ) : (
            <ScholarshipDirectory
              key={JSON.stringify(initialFilters)}
              programs={programs}
              initialFilters={initialFilters}
            />
          )}
        </div>
      </section>
    </>
  );
}
