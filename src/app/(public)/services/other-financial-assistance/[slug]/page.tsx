import { notFound } from "next/navigation";
import { ProgramDetail } from "@/src/components/program-detail";
import { getPublicPrograms } from "@/src/lib/content";

export const instant = false;

const programSlugs = [
  "upv-adopt-a-student-program",
  "upv-silak-silab-foundation-wellness-fund-grant",
  "lingap-iskolar-ng-bayan",
];

export function generateStaticParams() {
  return programSlugs.map((slug) => ({ slug }));
}

export default async function OtherFinancialAssistanceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = (await getPublicPrograms()).find(
    (item) => item.slug === slug && item.serviceSlug === "other-financial-assistance",
  );
  if (!program) notFound();
  return (
    <ProgramDetail
      program={program}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Services", href: "/services" },
        { label: "Other Financial Assistance", href: "/services/other-financial-assistance" },
        { label: program.name },
      ]}
    />
  );
}
