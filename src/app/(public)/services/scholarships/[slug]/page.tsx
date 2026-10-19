import { notFound } from "next/navigation";
import { ProgramDetail } from "@/src/components/program-detail";
import { programs } from "@/src/types/domain";
import { getPublicPrograms } from "@/src/lib/content";

export function generateStaticParams() { return programs.map((program) => ({ slug: program.slug })); }

export default async function ScholarshipDetailPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const program = (await getPublicPrograms()).find((item) => item.slug === slug && item.serviceSlug === "scholarships"); if (!program) notFound(); return <ProgramDetail program={program} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Scholarships", href: "/services/scholarships" }, { label: program.name }]} />; }
