import Link from "next/link";
import { Breadcrumbs } from "@/src/components/breadcrumbs";
import { getPublicServices } from "@/src/lib/content";

const serviceImages: Record<string, string> = {
  "slas-online": "/services/slas-online.jpg",
  scholarships: "/services/scholarships.jpg",
  "other-financial-assistance": "/services/other-financial-assistance.jpg",
  "student-assistantship": "/services/student-assistantship.jpg",
  "share-loan": "/services/share-loan.jpg",
  "student-insurance": "/services/student-insurance.jpg",
};

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
          <div className="service-directory-intro">
            <div>
              <p className="service-directory-kicker">Support from OSA-SFAU</p>
              <h2>Find the service that fits your next step.</h2>
            </div>
            <p>Browse official information on scholarships, financial assistance, work opportunities, loans, and student insurance.</p>
          </div>
          <div className="grid-3 service-directory-grid">
            {serviceList.map((service) => (
              <Link
                className={`card service-card${service.slug === "scholarships" ? " service-card--featured" : ""}`}
                href={
                  service.slug === "scholarships"
                    ? "/services/scholarships"
                    : `/services/${service.slug}`
                }
                key={service.slug}
              >
                <span
                  className="service-card-media"
                  style={{ backgroundImage: `url("${serviceImages[service.slug]}")` }}
                  aria-hidden="true"
                />
                <div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
