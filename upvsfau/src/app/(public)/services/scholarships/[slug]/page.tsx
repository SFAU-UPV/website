import { notFound } from "next/navigation";
import { ProgramDetail } from "@/src/components/program-detail";
import { getProgramBySlug, programs } from "@/src/types/domain";

export function generateStaticParams() { return programs.map((program) => ({ slug: program.slug })); }

export default async function ScholarshipDetailPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const program = getProgramBySlug(slug); if (!program || program.serviceSlug !== "scholarships") notFound(); return <ProgramDetail program={program} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Scholarships", href: "/services/scholarships" }, { label: program.name }]} />; }
