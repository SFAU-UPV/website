import { notFound } from "next/navigation";
import { ProgramDetail } from "@/src/components/program-detail";
import { services } from "@/src/types/domain";
import { getPublicServiceProgram } from "@/src/lib/content";

export function generateStaticParams() { return services.filter((service) => service.slug !== "scholarships").map((service) => ({ slug: service.slug })); }

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const program = await getPublicServiceProgram(slug); if (!program) notFound(); return <><section className="page-intro"><div className="container"><p className="eyebrow">Service detail</p><h1>{program.name}</h1><p>{program.summary}</p></div></section><ProgramDetail program={program} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: program.name }]} /></>; }
