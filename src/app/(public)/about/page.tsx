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
          <p>
            The Office of Student Affairs - Scholarships and Financial Assistance Unit supports
            equitable access to higher education for UP Visayas students.
          </p>
        </div>
      </section>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      <section className="section">
        <div className="container detail-layout">
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
                        width={120}
                        height={120}
                        sizes="(max-width: 720px) 96px, 120px"
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
              <div className="card">
                <p>
                  <strong>Email</strong>
                  <br />
                  <a className="text-link" href={`mailto:${siteConfig.contact.email}`}>
                    {siteConfig.contact.email}
                  </a>
                </p>
                <p>
                  <strong>Telephone</strong>
                  <br />
                  {siteConfig.contact.phone}
                </p>
                <p>
                  <strong>Office</strong>
                  <br />
                  {siteConfig.contact.office}
                </p>
                <p>
                  <strong>Office hours</strong>
                  <br />
                  {siteConfig.contact.hours}
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
