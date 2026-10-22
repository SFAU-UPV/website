import { SectionHeading } from "@/src/components/section-heading";
import Link from "next/link";
import { getPublicAnnouncementsResult, getPublicProgramsResult } from "@/src/lib/content";
import { EmptyState, ErrorState } from "@/src/components/data-states";
import { ServiceCarousel } from "@/src/components/service-carousel";
import { HeroActions } from "@/src/components/hero-actions";
import { FeaturedOpportunities } from "@/src/components/featured-opportunities";
import { HomeScrollMotion } from "@/src/components/home-scroll-motion";
import { services } from "@/src/types/domain";

export const instant = false;

export default async function HomePage() {
  const [programResult, announcementResult] = await Promise.all([
    getPublicProgramsResult(),
    getPublicAnnouncementsResult(),
  ]);
  const featuredPrograms = programResult.data
    .filter((program) => program.serviceSlug === "scholarships")
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 3);
  return (
    <>
      <HomeScrollMotion />
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-copy">
            <h1 className="typography typography--h1 typography--weight-bold">
              Find support for your UPV journey.
            </h1>
            <p className="typography typography--body">
              Browse official scholarships, financial assistance, and student support services from the Office of Student Affairs.
            </p>
          </div>
          <HeroActions />
          <div className="hero-note">
            <span>Start with what you need today.</span>
            <span>Application availability is shown only after SFAU verification.</span>
          </div>
        </div>
      </section>
      <section className="support-rail" aria-label="Student support categories">
        <div className="container support-rail-inner">
          <span className="support-rail-label">Find your starting point</span>
          <div className="support-rail-links">
            {services.slice(1, 5).map((service) => (
              <Link href={`/services/${service.slug}`} key={service.slug}>
                <strong>{service.name}</strong>
                <span>{service.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {announcementResult.status === "error" || announcementResult.data.length > 0 ? (
        <section className="section announcement-section">
          <div className="container">
            <SectionHeading title="What’s new from OSA-SFAU" />
            {announcementResult.status === "error" ? (
              <ErrorState />
            ) : (
              <div className="announcement-list">
                {announcementResult.data.map((announcement) => (
                  <article className="announcement-row" key={announcement.id}>
                    <div>
                      <h3>{announcement.title}</h3>
                      <p>{announcement.summary}</p>
                    </div>
                    <span>{announcement.publishedAt}</span>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}
      <section className="section">
        <div className="container">
          <SectionHeading title="Find the right kind of support" />
          <ServiceCarousel />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionHeading
            title="Start with the scholarship directory"
            intro="Browse by administering category. Application availability is shown only after SFAU verification."
          />
          <div data-home-scroll="scholarships">
            {programResult.status === "error" ? (
              <ErrorState />
            ) : featuredPrograms.length === 0 ? (
              <EmptyState
                title="No published opportunities"
                message="Verified scholarship information will appear here when published."
              />
            ) : (
              <FeaturedOpportunities programs={featuredPrograms} />
            )}
          </div>
        </div>
      </section>
      <section className="home-closing">
        <div className="container home-closing-inner">
          <div>
            <h2>Not sure where to start?</h2>
            <p>Browse the full OSA-SFAU service directory and find the support that fits your situation.</p>
          </div>
          <Link className="button button-primary" href="/services">View all services</Link>
        </div>
      </section>
    </>
  );
}
