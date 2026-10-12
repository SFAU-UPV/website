import { notFound } from "next/navigation";
import { services } from "@/src/types/domain";

export function generateStaticParams() { return services.map((service) => ({ slug: service.slug })); }

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const service = services.find((item) => item.slug === slug); if (!service) notFound(); return <><section className="page-intro"><div className="container"><p className="eyebrow">Home / Services</p><h1>{service.name}</h1><p>{service.description}</p></div></section><section className="section"><div className="container"><div className="card"><h2>{service.name}</h2><p>Information for this service will be maintained by SFAU administrators. Please check this page for verified guidance and official links.</p><div className="callout">No application action is available from this page until the relevant program or service information is verified.</div></div></div></section></>; }
