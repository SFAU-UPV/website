import Link from "next/link";
import { Breadcrumbs } from "@/src/components/breadcrumbs";
import { getPublicServices } from "@/src/lib/content";

export default function ServicesPage() {
  const serviceList = getPublicServices();
  return (
    <>
      <section className="page-intro">
        <div className="container">
          <h1>Our services</h1>
        </div>
      </section>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Services" }]} />
      <section className="section">
        <div className="container">
          <div className="grid-3">
            {serviceList.map((service) => (
              <Link
                className="card service-card"
                href={
                  service.slug === "scholarships"
                    ? "/services/scholarships"
                    : `/services/${service.slug}`
                }
                key={service.slug}
              >
                <div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                </div>
                <span className="text-link">View service</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
