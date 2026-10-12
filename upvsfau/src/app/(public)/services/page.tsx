import Link from "next/link";
import { SectionHeading } from "@/src/components/section-heading";
import { services } from "@/src/types/domain";

export default function ServicesPage() { return <><section className="page-intro"><div className="container"><p className="eyebrow">Home / Services</p><h1>Our services</h1><p>Explore scholarships, financial assistance, and student support services offered through SFAU.</p></div></section><section className="section"><div className="container"><SectionHeading title="Support programs and services" intro="Each service page will provide maintained information, eligibility guidance, and the correct official next step." /><div className="grid-3">{services.map((service) => <Link className="card service-card" href={`/services/${service.slug}`} key={service.slug}><div><h3>{service.name}</h3><p>{service.description}</p></div><span className="text-link">View service</span></Link>)}</div></div></section></>; }
