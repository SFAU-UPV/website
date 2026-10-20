import Link from "next/link";
import { SectionHeading } from "@/src/components/section-heading";
import { getPublicAnnouncements, getPublicPrograms } from "@/src/lib/content";
import { ServiceCarousel } from "@/src/components/service-carousel";
import { HeroActions } from "@/src/components/hero-actions";
import { FeaturedOpportunities } from "@/src/components/featured-opportunities";

export const instant = false;

export default async function HomePage() {
  const [programs, announcements] = await Promise.all([
    getPublicPrograms(),
    getPublicAnnouncements(),
  ]);
  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <p className="eyebrow typography typography--body-xs typography--weight-bold">
            Supporting UPV students
          </p>
          <h1 className="typography typography--h1 typography--weight-bold">
            Find support for your UPV journey.
          </h1>
          <p className="typography typography--body">
            Explore scholarships, financial assistance, and student support services from OSA-SFAU.
          </p>
          <HeroActions />
        </div>
      </section>
      {announcements.length > 0 ? (
        <section className="section" style={{ background: "#f1eadf" }}>
          <div className="container">
            <SectionHeading eyebrow="Latest announcements" title="What’s new from OSA-SFAU" />
            <div className="announcement-list">
              {announcements.map((announcement) => (
                <article className="announcement-row" key={announcement.id}>
                  <div>
                    <h3>{announcement.title}</h3>
                    <p>{announcement.summary}</p>
                  </div>
                  <span>{announcement.publishedAt}</span>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Services" title="Find the right kind of support" />
          <ServiceCarousel />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Featured opportunities"
            title="Start with the scholarship directory"
            intro="Browse by administering category. Application availability is shown only after SFAU verification."
          />
          <FeaturedOpportunities
            programs={programs
              .filter((program) => program.serviceSlug === "scholarships")
              .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
              .slice(0, 3)}
          />
        </div>
      </section>
      <section className="section">
        <div className="container mission-panel">
          <div>
            <p className="eyebrow">About the unit</p>
            <h2>Equitable access to higher education</h2>
          </div>
          <p>
            The OSA-SFAU administers and facilitates scholarship programs and financial assistance
            services, evaluates students’ financial circumstances, processes assistance
            applications, and helps students access available resources.
          </p>
          <Link className="text-link" href="/about">
            Read the OSA-SFAU overview
          </Link>
        </div>
      </section>
    </>
  );
}
