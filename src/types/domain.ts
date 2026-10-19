export type PublicationStatus = "draft" | "published" | "archived";
export type ApplicationAvailability = "unverified" | "upcoming" | "open" | "closed" | "suspended";
export type ApplicationStatus = ApplicationAvailability;
export type ScholarshipCategory = "up-administered" | "government" | "private";
export type ApplicationLinkType = "official-portal" | "google-form" | "other";

export interface ServiceCategory {
  slug: string;
  name: string;
  description: string;
}

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
  {
    slug: "slas-online",
    name: "SLAS Online",
    description: "Student Learning Assistance System for scholarship and assistance records.",
  },
  {
    slug: "scholarships",
    name: "Scholarship Programs",
    description: "UP-administered, government, and private scholarship opportunities.",
  },
  {
    slug: "other-financial-assistance",
    name: "Other Financial Assistance",
    description: "Support programs for students with financial need.",
  },
  {
    slug: "student-assistantship",
    name: "Student Assistantship",
    description: "Opportunities to work and gain experience while studying.",
  },
  {
    slug: "share-loan",
    name: "SHARE Loan Program",
    description: "Loan assistance information for eligible UPV students.",
  },
  {
    slug: "student-insurance",
    name: "UP Student Insurance Policy",
    description: "Information about student insurance coverage and benefits.",
  },
];

export const undergraduateDegreePrograms = [
  "BA Community Development",
  "BA Communication and Media Studies",
  "BA History",
  "BA Literature",
  "BA Political Science",
  "BA Psychology",
  "BA Sociology",
  "BS Accountancy",
  "BS Applied Mathematics",
  "BS Biology",
  "BS Chemical Engineering",
  "BS Chemistry",
  "BS Computer Science",
  "BS Economics",
  "BS Fisheries",
  "BS Food Technology",
  "BS Management",
  "BS Public Health",
  "BS Statistics",
  "BS Business Administration (Marketing)",
] as const;

export function getProgramCategories(program: Program): ScholarshipCategory[] {
  return Array.from(new Set([program.category, ...(program.categories ?? [])]));
}
export function getPrimaryCycle(program: Program): ApplicationCycle | undefined {
  return program.cycles?.[0];
}
function titleCaseDegree(value: string) {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
    .replace(/\bAnd\b/g, "and")
    .replace(/\bOf\b/g, "of")
    .replace(/\bIn\b/g, "in");
}
export function normalizeDegreeProgram(value: string) {
  let name = value
    .replace(/^\s*\d{3,6}\s*[-–:.)]?\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
  name = name
    .replace(/^BACHELOR OF SCIENCE IN\s+/i, "BS ")
    .replace(/^BACHELOR OF SCIENCE\s*\(\s*/i, "BS ")
    .replace(/^BACHELOR OF ARTS IN\s+/i, "BA ")
    .replace(/^BACHELOR OF ARTS\s*\(\s*/i, "BA ");
  name = name.replace(/\)\s*$/, "").replace(/^BA\s+LIT$/i, "BA Literature");
  return name.match(/^(BA|BS)\s+/i)
    ? name.slice(0, 2).toUpperCase() + " " + titleCaseDegree(name.slice(3))
    : titleCaseDegree(name);
}
export function normalizeDegreePrograms(values?: string[] | null) {
  return Array.from(
    new Set(
      (values ?? []).flatMap((value) => {
        const normalized = normalizeDegreeProgram(value);
        const lower = normalized.toLowerCase();
        const matches = undergraduateDegreePrograms.filter((degree) =>
          lower.includes(degree.slice(3).toLowerCase()),
        );
        return matches.length ? matches : normalized ? [normalized] : [];
      }),
    ),
  );
}

function manilaDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
function validHttps(url?: string) {
  try {
    return Boolean(url && new URL(url).protocol === "https:");
  } catch {
    return false;
  }
}
export const FIXTURE_NOW = new Date("2026-10-14T00:00:00+08:00");

export function resolveApplicationAvailability(
  cycle: ApplicationCycle | undefined,
  now = FIXTURE_NOW,
): ApplicationAvailability {
  if (!cycle) return "unverified";
  if (cycle.statusOverride) return cycle.statusOverride;
  if (cycle.declaredAvailability === "suspended") return "suspended";
  if (cycle.declaredAvailability === "closed") return "closed";
  if (cycle.declaredAvailability === "upcoming") return "upcoming";
  if (!validHttps(cycle.externalApplicationUrl)) return "unverified";
  const today = manilaDate(now);
  if (cycle.startsOn && today < cycle.startsOn) return "upcoming";
  if (cycle.endsOn && today > cycle.endsOn) return "closed";
  if (!cycle.startsOn && !cycle.endsOn) return "unverified";
  return "open";
}

export function canApply(program: Program, cycle = getPrimaryCycle(program), now = FIXTURE_NOW) {
  return (
    program.publicationStatus === "published" &&
    resolveApplicationAvailability(cycle, now) === "open" &&
    validHttps(cycle?.externalApplicationUrl)
  );
}
