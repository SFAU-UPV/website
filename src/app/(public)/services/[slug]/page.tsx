import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/src/components/breadcrumbs";
import { AssistanceDirectory } from "@/src/components/assistance-directory";
import {
  canApply,
  getPrimaryCycle,
  resolveApplicationAvailability,
  services,
  type Program,
} from "@/src/types/domain";
import { getPublicProgramsResult } from "@/src/lib/content";
import { ErrorState } from "@/src/components/data-states";
import { StatusBadge } from "@/src/components/status-badge";
import { siteConfig } from "@/src/lib/constants";

export const instant = false;

export function generateStaticParams() {
  return services
    .filter((service) => service.slug !== "scholarships")
    .map((service) => ({ slug: service.slug }));
}

function SlasOnlineContent() {
  return (
    <>
      <section className="service-overview">
        <div>
          <p className="eyebrow">Financial assistance intake</p>
          <h2>What is SLAS Online?</h2>
          <p>
            SLAS Online is a web-based program that collects information from students who wish to
            obtain financial assistance.
          </p>
        </div>
        <div className="service-overview-note">
          <strong>How it helps</strong>
          <p>
            The information helps the University identify students who are in dire need of financial
            support through monthly stipends or cash allowances based on household paying capacity
            and socioeconomic indicators.
          </p>
        </div>
      </section>
      <section className="prose-section service-content-section">
        <h2>Household income categories</h2>
        <div className="service-table-wrap">
          <table className="service-table">
            <thead>
              <tr>
                <th>Estimated annual household income</th>
                <th>GIAP financial assistance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>₱80,000 and less</td>
                <td>FDS: Full Discount plus ₱5,000 monthly stipend</td>
              </tr>
              <tr>
                <td>₱80,001 to ₱135,000</td>
                <td>FD: Full Discount</td>
              </tr>
              <tr>
                <td>₱135,001 to ₱325,000</td>
                <td>PD80: Partial Discount equivalent to 80% of tuition</td>
              </tr>
              <tr>
                <td>₱325,001 to ₱650,000</td>
                <td>PD60: Partial Discount equivalent to 60% of tuition</td>
              </tr>
              <tr>
                <td>₱650,001 to ₱1,300,000</td>
                <td>PD40: Partial Discount equivalent to 40% of tuition</td>
              </tr>
              <tr>
                <td>₱1,300,001 and above</td>
                <td>ND: No Tuition Discount</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section className="prose-section service-content-section">
        <h2>Who may apply?</h2>
        <ul>
          <li>Students may use SLAS Online to apply for available financial assistance.</li>
          <li>
            Students on their <em>nth</em> year may also log in and complete the forms if they seek
            to apply for a tuition subsidy.
          </li>
        </ul>
      </section>
      <section className="service-external-callout">
        <div>
          <h2>Open the SLAS Online portal</h2>
          <p>
            Portal openings and application instructions are posted through the official SLAS Online
            website.
          </p>
        </div>
        <a
          className="button button-primary"
          href="https://slasonline.up.edu.ph/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit SLAS Online <span aria-hidden="true">↗</span>
        </a>
      </section>
    </>
  );
}

function OtherFinancialAssistanceContent({
  programs,
}: {
  programs: Pick<
    import("@/src/types/domain").Program,
    "id" | "name" | "slug" | "benefits" | "degreePrograms"
  >[];
}) {
  return (
    <>
      <section className="service-overview">
        <div>
          <p className="eyebrow">Student support programs</p>
          <h2>Other financial assistance</h2>
          <p>
            Explore assistance programs available through the University of the Philippines Visayas
            and its partners.
          </p>
        </div>
        <div className="service-overview-note">
          <strong>Program availability</strong>
          <p>
            Application periods and requirements may vary by program. Check the official
            announcement before applying.
          </p>
        </div>
      </section>
      <section className="service-content-section other-assistance-programs">
        <p className="eyebrow">Available programs</p>
        <h2>Programs</h2>
        <AssistanceDirectory programs={programs} />
      </section>
    </>
  );
}

function StudentAssistantshipContent({ program }: { program?: Program }) {
  const cycle = program ? getPrimaryCycle(program) : undefined;
  const availability = resolveApplicationAvailability(cycle);
  const applyEnabled = Boolean(
    program && cycle?.externalApplicationUrl && canApply(program, cycle),
  );
  return (
    <>
      <section className="service-overview">
        <div>
          <p className="eyebrow">Student employment assistance</p>
          <h2>Student Assistantship Program</h2>
          <p>
            The program provides eligible undergraduate students with part-time work opportunities
            within the University while supporting their financial needs.
          </p>
        </div>
        <div className="service-overview-note">
          <strong>Program benefit</strong>
          <p>
            Student assistants receive &#8369;81.00 per hour, up to a maximum of 30 hours per month.
          </p>
        </div>
      </section>
      <section className="prose-section service-content-section">
        <h2>Who may apply?</h2>
        <ul>
          <li>All undergraduate students may apply, except first-year students.</li>
          <li>Applicants must be in good academic standing during the previous semester.</li>
        </ul>
      </section>
      <section className="prose-section service-content-section">
        <h2>Work assignments</h2>
        <p>
          Student assistants may be assigned to designated University offices and facilities,
          including libraries, dormitories, laboratories, and administrative offices.
        </p>
      </section>
      <section className="prose-section service-content-section">
        <h2>Required documents</h2>
        <ol className="service-requirements-list">
          <li>Application and Data Privacy Consent Form (A4 size)</li>
          <li>Resume (A4 size)</li>
          <li>Proposed Working Schedule Form reflecting all available schedules for duty</li>
          <li>1×1 ID picture attached to the resume</li>
          <li>Proof of household income, such as the current ITR or an equivalent document</li>
        </ol>
        <div className="service-reminders">
          <strong>Submission reminders</strong>
          <ul>
            <li>All information must be typewritten.</li>
            <li>E-signatures are not allowed.</li>
            <li>Applications with incomplete documents will not be entertained.</li>
          </ul>
        </div>
      </section>
      <section className="service-external-callout">
        <div>
          <h2>Application portal</h2>
          <p>
            Application periods recur each semester. Check this page for the current application
            link and availability.
          </p>
        </div>
        <div className="service-application-action">
          <StatusBadge status={availability} />
          {applyEnabled ? (
            <a
              className="button button-primary"
              href={cycle?.externalApplicationUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply for Student Assistantship <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <span className="button button-disabled" aria-disabled="true">
              Application link coming soon
            </span>
          )}
        </div>
      </section>
    </>
  );
}

function ShareLoanContent() {
  return (
    <>
      <section className="service-overview">
        <div>
          <p className="eyebrow">Emergency student support</p>
          <h2>Student Health and Related Emergency Loan</h2>
          <p>
            SHARE stands for Student Health and Related Emergency. It provides a loan option for
            bona fide students facing an assessed health or related emergency need.
          </p>
        </div>
        <div className="service-overview-note">
          <strong>Loan amount</strong>
          <p>
            &#8369;500.00 to &#8369;5,000.00, subject to the student’s assessed need and SFAU
            approval.
          </p>
        </div>
      </section>
      <section className="prose-section service-content-section">
        <h2>Eligibility and approval</h2>
        <ul>
          <li>All bona fide students may apply.</li>
          <li>
            Approval depends on the student’s assessed need conducted by the Scholarships and
            Financial Assistance Unit.
          </li>
        </ul>
      </section>
      <section className="prose-section service-content-section">
        <h2>Repayment</h2>
        <div className="service-facts-grid">
          <div>
            <strong>Payment period</strong>
            <p>The student has one month to pay the loan without additional fees.</p>
          </div>
          <div>
            <strong>Delayed payment</strong>
            <p>
              A 0.5% service fee is added for each month the payment is delayed after the first
              month.
            </p>
          </div>
        </div>
      </section>
      <section className="prose-section service-content-section">
        <h2>Co-debtor requirement</h2>
        <p>
          A co-debtor is required to apply. Only regular permanent University personnel may act as
          co-debtor, and each co-debtor may support a maximum of two students.
        </p>
      </section>
      <section className="service-external-callout">
        <div>
          <h2>Contact SFAU</h2>
          <p>
            Email the Scholarships and Financial Assistance Unit to ask about the SHARE Loan
            application process.
          </p>
        </div>
        <a
          className="button button-primary"
          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(siteConfig.contact.email)}&su=${encodeURIComponent("SHARE Loan Program Inquiry")}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Email SFAU <span aria-hidden="true">↗</span>
        </a>
      </section>
    </>
  );
}

function StudentInsuranceContent() {
  return (
    <>
      <section className="service-overview">
        <div>
          <p className="eyebrow">Student protection</p>
          <h2>UP Student Insurance Policy</h2>
          <p>
            The UP System encourages the provision of insurance to students while they are enrolled
            in the University.
          </p>
        </div>
        <div className="service-overview-note">
          <strong>Protection period</strong>
          <p>
            Coverage is valid for 12 months from UP’s confirmation of the availment of insurance.
          </p>
        </div>
      </section>
      <section className="prose-section service-content-section">
        <h2>What the policy covers</h2>
        <p>
          The policy is intended to cover the portion of accident costs, hospitalization, and
          medical care, especially when students participate in academic and similar experiential
          learning activities outside classrooms.
        </p>
      </section>
      <section
        className="service-content-section insurance-highlights"
        aria-label="Insurance coverage highlights"
      >
        <div>
          <span aria-hidden="true">01</span>
          <strong>Accident costs</strong>
          <p>Support for covered expenses resulting from accidents.</p>
        </div>
        <div>
          <span aria-hidden="true">02</span>
          <strong>Hospitalization</strong>
          <p>Protection that may help with covered hospitalization costs.</p>
        </div>
        <div>
          <span aria-hidden="true">03</span>
          <strong>Medical care</strong>
          <p>Coverage support for eligible medical care expenses.</p>
        </div>
      </section>
      <section className="service-reminders service-policy-note">
        <strong>Coverage reminder</strong>
        <p>
          For the complete terms, eligibility conditions, and claims process, students should follow
          the official UP and SFAU announcements.
        </p>
      </section>
      <section className="service-external-callout">
        <div>
          <h2>Have a question?</h2>
          <p>Contact SFAU for questions about insurance coverage, eligibility, or claims.</p>
        </div>
        <a
          className="button button-primary"
          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(siteConfig.contact.email)}&su=${encodeURIComponent("UP Student Insurance Policy Inquiry")}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Email SFAU <span aria-hidden="true">↗</span>
        </a>
      </section>
    </>
  );
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug && item.slug !== "scholarships");
  if (!service) notFound();
  const isSlas = service.slug === "slas-online";
  const isOtherFinancialAssistance = service.slug === "other-financial-assistance";
  const programResult = await getPublicProgramsResult();
  const publicPrograms = programResult.data;
  const assistancePrograms = isOtherFinancialAssistance
    ? publicPrograms.filter((program) => program.serviceSlug === "other-financial-assistance")
    : [];
  const assistantshipProgram =
    service.slug === "student-assistantship"
      ? publicPrograms.find((program) => program.serviceSlug === "student-assistantship")
      : undefined;
  return (
    <>
      <section className="page-intro">
        <div className="container">
          <p className="eyebrow">Service detail</p>
          <h1>{service.name}</h1>
          <p>{service.description}</p>
        </div>
      </section>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.name },
        ]}
      />
      <section className="section">
        <div className="container service-detail-content">
          {programResult.status === "error" && (isOtherFinancialAssistance || service.slug === "student-assistantship") ? (
            <ErrorState />
          ) : isSlas ? (
            <SlasOnlineContent />
          ) : isOtherFinancialAssistance ? (
            <OtherFinancialAssistanceContent programs={assistancePrograms} />
          ) : service.slug === "student-assistantship" ? (
            <StudentAssistantshipContent program={assistantshipProgram} />
          ) : service.slug === "share-loan" ? (
            <ShareLoanContent />
          ) : service.slug === "student-insurance" ? (
            <StudentInsuranceContent />
          ) : (
            <div className="availability-panel availability-unverified">
              <strong>Information coming soon</strong>
              <p>Details for this service are being prepared by the Office of Student Affairs.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
