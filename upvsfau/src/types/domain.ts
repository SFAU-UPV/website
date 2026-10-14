export type PublicationStatus = "draft" | "published" | "archived";
export type ApplicationAvailability = "unverified" | "upcoming" | "open" | "closed" | "suspended";
export type ApplicationStatus = ApplicationAvailability;
export type ScholarshipCategory = "up-administered" | "government" | "private";
export type ApplicationLinkType = "official-portal" | "google-form" | "other";

export interface ServiceCategory { slug: string; name: string; description: string; }

export interface ApplicationCycle {
  id: string;
  programId: string;
  startsOn: string | null;
  endsOn: string | null;
  declaredAvailability: ApplicationAvailability;
  verificationStatus: "unverified" | "verified";
  statusOverride?: Exclude<ApplicationAvailability, "unverified">;
  externalApplicationUrl?: string;
  linkType?: ApplicationLinkType;
  verifiedAt?: string;
}

export interface Program {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description?: string;
  category: ScholarshipCategory;
  categories?: ScholarshipCategory[];
  serviceSlug: string;
  publicationStatus: PublicationStatus;
  degreePrograms?: string[];
  eligibility?: string[];
  requirements?: string[];
  benefits?: string[];
  applicationProcess?: string[];
  contact?: { label: string; value: string; href?: string }[];
  officialSourceUrl?: string;
  cycles?: ApplicationCycle[];
  applicationStatus?: ApplicationAvailability;
  externalApplicationUrl?: string;
  featured?: boolean;
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
  { id: "mock-program-lingap", slug: "upv-lingap-iskolar-program", name: "UPV Lingap-Iskolar Program", summary: "Financial assistance information for deserving UPV students.", category: "up-administered", serviceSlug: "scholarships", publicationStatus: "published", degreePrograms: ["All undergraduate programs", "Graduate programs"], eligibility: ["Eligibility details require SFAU verification."], requirements: ["Requirements require SFAU verification."], benefits: ["Benefits require SFAU verification."], applicationProcess: ["Review the official announcement before applying."], cycles: [{ id: "mock-cycle-lingap", programId: "mock-program-lingap", startsOn: null, endsOn: null, declaredAvailability: "unverified", verificationStatus: "unverified" }], featured: true },
  { id: "mock-program-government", slug: "government-scholarship-opportunity", name: "Government Scholarship Opportunity", summary: "A static fixture for a government-administered scholarship awaiting SFAU verification.", category: "government", serviceSlug: "scholarships", publicationStatus: "published", degreePrograms: ["Selected degree programs"], cycles: [{ id: "mock-cycle-government", programId: "mock-program-government", startsOn: "2099-03-01", endsOn: "2099-04-30", declaredAvailability: "upcoming", verificationStatus: "verified" }] },
  { id: "mock-program-private", slug: "private-scholarship-opportunity", name: "Private Scholarship Opportunity", summary: "A static fixture for a private scholarship awaiting SFAU verification.", category: "private", serviceSlug: "scholarships", publicationStatus: "published", degreePrograms: ["Selected degree programs"], cycles: [{ id: "mock-cycle-private", programId: "mock-program-private", startsOn: "2025-03-01", endsOn: "2025-04-30", declaredAvailability: "open", verificationStatus: "verified", externalApplicationUrl: "https://example.com/application", linkType: "official-portal" }] },
  { id: "mock-program-cross-listed", slug: "upv-access-scholarship", name: "UPV Access Scholarship", summary: "A single cross-listed fixture shared by UP-administered and government categories.", category: "up-administered", categories: ["government"], serviceSlug: "scholarships", publicationStatus: "published", degreePrograms: ["All undergraduate programs"], cycles: [{ id: "mock-cycle-cross-listed", programId: "mock-program-cross-listed", startsOn: "2099-08-01", endsOn: "2099-09-15", declaredAvailability: "upcoming", verificationStatus: "verified" }] },
  { id: "mock-program-closed", slug: "closed-assistance-program", name: "Closed Assistance Program", summary: "A closed fixture retained in the directory for reference and discovery.", category: "private", serviceSlug: "scholarships", publicationStatus: "published", degreePrograms: ["All undergraduate programs"], cycles: [{ id: "mock-cycle-closed", programId: "mock-program-closed", startsOn: "2025-01-01", endsOn: "2025-01-31", declaredAvailability: "closed", verificationStatus: "verified" }] },
  { id: "mock-program-suspended", slug: "suspended-scholarship-program", name: "Suspended Scholarship Program", summary: "A suspended fixture with no enabled application action.", category: "government", serviceSlug: "scholarships", publicationStatus: "published", degreePrograms: ["Selected degree programs"], cycles: [{ id: "mock-cycle-suspended", programId: "mock-program-suspended", startsOn: null, endsOn: null, declaredAvailability: "open", verificationStatus: "verified", statusOverride: "suspended" }] },
];

export const servicePrograms: Program[] = services
  .filter((service) => service.slug !== "scholarships")
  .map((service) => ({
    id: `mock-service-${service.slug}`,
    slug: service.slug,
    name: service.name,
    summary: service.description,
    category: "up-administered" as const,
    serviceSlug: service.slug,
    publicationStatus: "published" as const,
    description: `${service.name} information is maintained by OSA-SFAU and will be expanded with verified guidance.`,
    applicationProcess: ["Check the official OSA-SFAU announcement or service guidance before taking action."],
    cycles: [{ id: `mock-cycle-${service.slug}`, programId: `mock-service-${service.slug}`, startsOn: null, endsOn: null, declaredAvailability: "unverified" as const, verificationStatus: "unverified" as const }],
  }));

export function getProgramCategories(program: Program): ScholarshipCategory[] { return Array.from(new Set([program.category, ...(program.categories ?? [])])); }
export function getPrimaryCycle(program: Program): ApplicationCycle | undefined { return program.cycles?.[0]; }
export function getProgramBySlug(slug: string) { return [...programs, ...servicePrograms].find((program) => program.slug === slug && program.publicationStatus === "published"); }

function manilaDate(date: Date) { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).format(date); }
function validHttps(url?: string) { try { return Boolean(url && new URL(url).protocol === "https:"); } catch { return false; } }
export const FIXTURE_NOW = new Date("2026-10-14T00:00:00+08:00");

export function resolveApplicationAvailability(cycle: ApplicationCycle | undefined, now = FIXTURE_NOW): ApplicationAvailability {
  if (!cycle) return "unverified";
  if (cycle.statusOverride) return cycle.statusOverride;
  if (cycle.verificationStatus !== "verified") return "unverified";
  if (cycle.declaredAvailability === "suspended") return "suspended";
  if (cycle.declaredAvailability === "closed") return "closed";
  if (cycle.declaredAvailability === "upcoming") return "upcoming";
  if (cycle.declaredAvailability !== "open" || !validHttps(cycle.externalApplicationUrl)) return "unverified";
  const today = manilaDate(now);
  if (cycle.startsOn && today < cycle.startsOn) return "upcoming";
  if (cycle.endsOn && today > cycle.endsOn) return "closed";
  if (!cycle.startsOn && !cycle.endsOn) return "unverified";
  return "open";
}

export function canApply(program: Program, cycle = getPrimaryCycle(program), now = FIXTURE_NOW) { return program.publicationStatus === "published" && resolveApplicationAvailability(cycle, now) === "open" && validHttps(cycle?.externalApplicationUrl); }
