import { SectionHeading } from "@/src/components/section-heading";
import { getPublicAnnouncementsResult, getPublicProgramsResult } from "@/src/lib/content";
import { EmptyState, ErrorState } from "@/src/components/data-states";
import { ServiceCarousel } from "@/src/components/service-carousel";
import { HeroActions } from "@/src/components/hero-actions";
import { FeaturedOpportunities } from "@/src/components/featured-opportunities";
import { HomeScrollMotion } from "@/src/components/home-scroll-motion";

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
          <h1 className="typography typography--h1 typography--weight-bold">
            Find support for your UPV journey.
          </h1>
          <p className="typography typography--body">
            Explore scholarships, financial assistance, and student support services from OSA-SFAU.
          </p>
          <HeroActions />
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
    </>
  );
}
