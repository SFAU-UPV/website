export type PublicationStatus = "draft" | "published" | "archived";
export type ApplicationStatus =
  | "unverified"
  | "upcoming"
  | "open"
  | "closed"
  | "suspended";

export type ScholarshipCategory = "up-administered" | "government" | "private";

export interface ServiceCategory {
  slug: string;
  name: string;
  description: string;
}

export interface Program {
  id: string;
  slug: string;
  name: string;
  summary: string;
  category: ScholarshipCategory | "other-assistance";
  serviceSlug: string;
  publicationStatus: PublicationStatus;
  applicationStatus: ApplicationStatus;
  externalApplicationUrl?: string;
  featured?: boolean;
}

export interface ApplicationCycle {
  id: string;
  programId: string;
  startsOn: string | null;
  endsOn: string | null;
  verificationStatus: Exclude<ApplicationStatus, "unverified"> | "unverified";
  overrideStatus?: Exclude<ApplicationStatus, "unverified">;
}

export const services: ServiceCategory[] = [
  { slug: "slas-online", name: "SLAS Online", description: "Student Learning Assistance System for scholarship and assistance records." },
  { slug: "scholarships", name: "Scholarship Programs", description: "UP-administered, government, and private scholarship opportunities." },
  { slug: "other-financial-assistance", name: "Other Financial Assistance", description: "Support programs for students with financial need." },
  { slug: "student-assistantship", name: "Student Assistantship", description: "Opportunities to work and gain experience while studying." },
  { slug: "share-loan", name: "SHARE Loan Program", description: "Loan assistance information for eligible UPV students." },
  { slug: "student-insurance", name: "UP Student Insurance Policy", description: "Information about student insurance coverage and benefits." },
];

export const programs: Program[] = [
  { id: "demo-lingap", slug: "upv-lingap-iskolar-program", name: "UPV Lingap-Iskolar Program", summary: "Financial assistance information for deserving UPV students.", category: "up-administered", serviceSlug: "scholarships", publicationStatus: "published", applicationStatus: "unverified", featured: true },
  { id: "demo-government", slug: "government-scholarship-opportunity", name: "Government Scholarship Opportunity", summary: "A placeholder record for a government-administered scholarship awaiting SFAU verification.", category: "government", serviceSlug: "scholarships", publicationStatus: "published", applicationStatus: "unverified" },
  { id: "demo-private", slug: "private-scholarship-opportunity", name: "Private Scholarship Opportunity", summary: "A placeholder record for a private scholarship awaiting SFAU verification.", category: "private", serviceSlug: "scholarships", publicationStatus: "published", applicationStatus: "unverified" },
];

export function getProgramBySlug(slug: string) {
  return programs.find((program) => program.slug === slug && program.publicationStatus === "published");
}

export function canApply(program: Program, cycle?: ApplicationCycle) {
  return Boolean(
    program.publicationStatus === "published" &&
    cycle?.verificationStatus === "open" &&
    cycle.overrideStatus !== "suspended" &&
    program.externalApplicationUrl &&
    /^https:\/\//.test(program.externalApplicationUrl),
  );
}
