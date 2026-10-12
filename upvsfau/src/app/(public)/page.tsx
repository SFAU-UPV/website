import Link from "next/link";
import { SectionHeading } from "@/src/components/section-heading";
import { StatusBadge } from "@/src/components/status-badge";
import { programs, services } from "@/src/types/domain";

export default function HomePage() {
  return <>
    <section className="hero"><div className="container hero-content"><p className="eyebrow">Supporting UPV students</p><h1>Scholarships and financial assistance, made easier to find.</h1><p>Find official information about opportunities and services coordinated by the Scholarships and Financial Assistance Unit.</p><div className="button-row"><Link className="button button-primary" href="/services/scholarships">Explore scholarships</Link><Link className="button button-secondary" href="/about">Learn about SFAU</Link></div></div></section>
    <section className="section"><div className="container"><SectionHeading eyebrow="Services" title="Support for every step of your student journey" intro="Browse the services available through SFAU. Program details and application availability are verified and maintained by administrators." /><div className="grid-3">{services.map((service, index) => <Link className="card service-card" href={`/services/${service.slug}`} key={service.slug}><div><div className="service-icon" aria-hidden="true">{["◈", "✦", "＋", "♧", "▣", "◇"][index]}</div><h3>{service.name}</h3><p>{service.description}</p></div><span className="text-link">Learn more</span></Link>)}</div></div></section>
    <section className="section" style={{ background: "#f1eadf" }}><div className="container"><div className="section-heading"><p className="eyebrow">Featured opportunities</p><h2>Scholarships directory</h2><p>Explore by administering category. Availability is shown only after SFAU verification.</p></div><div className="program-list">{programs.map((program) => <Link className="card program-row" href={`/services/scholarships/${program.slug}`} key={program.id}><div><h3>{program.name}</h3><p>{program.summary}</p></div><div className="program-meta"><StatusBadge status={program.applicationStatus} /><span aria-hidden="true">→</span></div></Link>)}</div><div className="button-row"><Link className="button button-primary" href="/services/scholarships">View all scholarships</Link></div></div></section>
  </>;
}
