import { siteConfig } from "@/src/lib/constants";
import { Breadcrumbs } from "@/src/components/breadcrumbs";
import Image from "next/image";

const sfauTeam = [
  {
    name: "Marites E. Geonanga",
    image: "marites-genonanga.png",
    roles: ["Scholarship Affairs Officer"],
  },
  {
    name: "Myko Andrea F. Embutin",
    image: "myko-embutin.png",
    roles: ["DOST Scholarship", "GSIS Insurance", "SLAS"],
  },
  { name: "Ofel Cate M. Nonato", image: "ofel-nonato.png", roles: ["Scholarships"] },
  {
    name: "Pamela O. Salcedo",
    image: "pamela-salcedo.png",
    roles: ["Scholarships", "SHARE Loan", "Student Assistantship"],
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="page-intro">
        <div className="container">
          <h1>About OSA-SFAU</h1>
        </div>
      </section>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      <section className="section">
        <div className="container about-page">
          <div className="about-overview">
            <div>
              <h2>Support information for UP Visayas students</h2>
              <p>
                The Office of Student Affairs - Scholarships and Financial Assistance Unit helps
                students understand available scholarships, financial assistance, and related
                support services.
              </p>
            </div>
            <nav className="about-page-nav" aria-label="About page sections">
              <strong>On this page</strong>
              <a href="#mandate">Mandate and functions</a>
              <a href="#team">SFAU team</a>
              <a href="#contact">Contact information</a>
            </nav>
          </div>
          <article>
            <div className="prose-section" id="mandate">
              <h2>Mandate and Functions</h2>
              <p>
                The unit implements programs such as the Student Learning Assistance System (SLAS),
                socialized tuition assessment, and the Student Assistantship Program. It evaluates
                students&apos; financial circumstances, processes applications for assistance, and
                facilitates access to available financial resources to promote equitable access to
                higher education and help students pursue their academic goals.
              </p>
            </div>
            <div className="prose-section" id="team">
              <h2>Scholarships and Financial Assistance Unit</h2>
              <div className="team-grid">
                {sfauTeam.map((member, index) => (
                  <article
                    className={`team-card${index === 0 ? " team-lead" : ""}`}
                    key={member.name}
                  >
                    <div className="team-photo-frame">
                      <Image
                        src={`/about/team/${member.image}`}
                        alt={`${member.name}, SFAU staff`}
                        width={1414}
                        height={2000}
                        sizes="(max-width: 720px) 96px, (min-width: 1600px) 192px, (min-width: 1000px) 12vw, 120px"
                      />
                    </div>
                    <div className="team-card-content">
                      <h3>{member.name}</h3>
                      {member.roles.map((role) => (
                        <p key={role}>{role}</p>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="prose-section" id="contact">
              <h2>Contact information</h2>
              <dl className="about-contact-details">
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a className="text-link" href={`mailto:${siteConfig.contact.email}`}>
                      {siteConfig.contact.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Telephone</dt>
                  <dd>
                    <a
                      className="text-link"
                      href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, "")}`}
                    >
                      {siteConfig.contact.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Office</dt>
                  <dd>{siteConfig.contact.office}</dd>
                </div>
                <div>
                  <dt>Office hours</dt>
                  <dd>{siteConfig.contact.hours}</dd>
                </div>
              </dl>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
