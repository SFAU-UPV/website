import { notFound } from "next/navigation";
import { ProgramDetail } from "@/src/components/program-detail";
import { getPublicProgramsResult } from "@/src/lib/content";
import { ErrorState } from "@/src/components/data-states";

export const instant = false;

export default async function ScholarshipDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPublicProgramsResult();
  if (result.status === "error") {
    return <div className="container section"><ErrorState /></div>;
  }
  const program = result.data.find(
    (item) => item.slug === slug && item.serviceSlug === "scholarships",
  );
  if (!program) notFound();
  return (
    <ProgramDetail
      program={program}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Services", href: "/services" },
        { label: "Scholarships", href: "/services/scholarships" },
        { label: program.name },
      ]}
    />
  );
}
