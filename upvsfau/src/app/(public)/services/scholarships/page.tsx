import { Breadcrumbs } from "@/src/components/breadcrumbs";
import { getPublicPrograms } from "@/src/lib/content";
import { ScholarshipDirectory } from "@/src/components/scholarship-directory";

export default async function ScholarshipsPage() { const programs = await getPublicPrograms(); return <><section className="page-intro"><div className="container"><p className="eyebrow">Scholarship directory</p><h1>Scholarship programs</h1><p>Explore opportunities administered by UP, government agencies, and private institutions.</p></div></section><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Scholarships" }]} /><section className="section"><div className="container"><ScholarshipDirectory programs={programs} /></div></section></>; }
