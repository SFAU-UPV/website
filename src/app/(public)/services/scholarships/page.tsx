import { Breadcrumbs } from "@/src/components/breadcrumbs";
import { getPublicPrograms } from "@/src/lib/content";
import { ScholarshipDirectory } from "@/src/components/scholarship-directory";

export const instant = false;

const otherAssistanceNames = new Set([
  "upv adopt-a-student program",
  "upv silak-silab foundation wellness fund grant",
  "lingap iskolar ng bayan",
]);

export default async function ScholarshipsPage() {
  const programs = (await getPublicPrograms()).filter(
    (program) =>
      program.serviceSlug === "scholarships" &&
      !otherAssistanceNames.has(program.name.trim().toLowerCase()),
  );
  return (
    <>
      <section className="page-intro">
        <div className="container">
          <p className="eyebrow">Scholarship Directory</p>
          <h1>Scholarship Programs</h1>
          <p>
            Explore opportunities administered by UP, Government Agencies, and Private Institutions.
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
          <ScholarshipDirectory programs={programs} />
        </div>
      </section>
    </>
  );
}
