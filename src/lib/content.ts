import { getNeonSql, isNeonConfigured } from "@/src/lib/neon/db";
import {
  normalizeDegreePrograms,
  services,
  type ApplicationCycle,
  type ApplicationLinkType,
  type Program,
  type ServiceCategory,
} from "@/src/types/domain";

export interface Announcement {
  id: string;
  title: string;
  summary: string;
  body?: string;
  pinned: boolean;
  publishedAt: string;
}

type DbCycle = {
  id: string;
  program_id: string;
  verified_open_at: string | null;
  close_at: string | null;
  external_url: string | null;
  link_type: ApplicationLinkType | null;
  verification_state: "unverified" | "verified";
  admin_override: ApplicationCycle["statusOverride"] | null;
};
type DbProgram = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string | null;
  publication_status: "draft" | "published" | "archived";
  eligibility: string[] | null;
  requirements: string[] | null;
  benefits: string[] | null;
  degree_programs: string[] | null;
  application_process: string[] | null;
  contact: unknown;
  official_source_url: string | null;
  service_slug: string | null;
  category_slugs: string[] | null;
  application_cycles: DbCycle[] | null;
};

function safeContact(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is { label: string; value: string; href?: string } =>
        Boolean(
          item &&
          typeof item === "object" &&
          "label" in item &&
          "value" in item &&
          typeof item.label === "string" &&
          typeof item.value === "string",
        ),
      )
    : undefined;
}
function mapCycle(row: DbCycle): ApplicationCycle {
  return {
    id: row.id,
    programId: row.program_id,
    startsOn: row.verified_open_at?.slice(0, 10) ?? null,
    endsOn: row.close_at?.slice(0, 10) ?? null,
    declaredAvailability: row.admin_override ?? (row.external_url ? "open" : "unverified"),
    verificationStatus: row.verification_state,
    externalApplicationUrl: row.external_url ?? undefined,
    linkType: row.link_type ?? undefined,
    statusOverride: row.admin_override ?? undefined,
  };
}
function mapProgram(row: DbProgram): Program {
  const categories = (row.category_slugs ?? [])
    .map((item) => String(item).trim().toLowerCase())
    .filter(
      (item): item is Program["category"] =>
        item === "up-administered" || item === "government" || item === "private",
    );
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.description ?? "",
    description: row.description ?? undefined,
    category: categories[0] ?? "up-administered",
    categories: categories.slice(1),
    serviceSlug: row.service_slug ?? "scholarships",
    publicationStatus: row.publication_status,
    degreePrograms: normalizeDegreePrograms(row.degree_programs),
    eligibility: row.eligibility ?? undefined,
    requirements: row.requirements ?? undefined,
    benefits: row.benefits ?? undefined,
    applicationProcess: row.application_process ?? undefined,
    contact: safeContact(row.contact),
    officialSourceUrl: row.official_source_url ?? undefined,
    cycles: row.application_cycles?.map(mapCycle),
  };
}

export function getPublicServices(): ServiceCategory[] {
  return services;
}

export async function getPublicPrograms(): Promise<Program[]> {
  if (!isNeonConfigured()) return [];
  try {
    const rows = (await getNeonSql().query(
      `select p.id, p.slug, p.name, p.summary, p.description, p.publication_status, p.eligibility, p.requirements, p.benefits, p.degree_programs, p.application_process, p.contact, p.official_source_url, sc.slug as service_slug, coalesce(array_agg(distinct sh.slug::text) filter (where sh.slug is not null), '{}') as category_slugs, coalesce(jsonb_agg(distinct jsonb_build_object('id', ac.id, 'program_id', ac.program_id, 'verified_open_at', ac.verified_open_at, 'close_at', ac.close_at, 'external_url', ac.external_url, 'link_type', ac.link_type, 'verification_state', ac.verification_state, 'admin_override', ac.admin_override)) filter (where ac.id is not null), '[]') as application_cycles from programs p left join service_categories sc on sc.id = p.service_category_id left join program_category_links pcl on pcl.program_id = p.id left join scholarship_categories sh on sh.id = pcl.category_id left join application_cycles ac on ac.program_id = p.id and ac.archived_at is null where p.publication_status = 'published' and p.archived_at is null group by p.id, sc.slug order by p.name`,
    )) as unknown as DbProgram[];
    return rows.map(mapProgram);
  } catch (error) {
    console.warn("Neon public query unavailable; returning no public programs.", error);
    return [];
  }
}

export async function getPublicServiceProgram(slug: string): Promise<Program | undefined> {
  const databasePrograms = await getPublicPrograms();
  return databasePrograms.find(
    (program) => program.slug === slug && program.publicationStatus === "published",
  );
}

export async function getPublicAnnouncements(): Promise<Announcement[]> {
  if (!isNeonConfigured()) return [];
  try {
    const rows = (await getNeonSql().query(
      `select id, title, summary, body, pinned, published_at, scheduled_at from announcements where publication_status = 'published' and archived_at is null and (scheduled_at is null or scheduled_at <= now()) order by pinned desc, coalesce(published_at, created_at) desc`,
    )) as unknown as {
      id: string;
      title: string;
      summary: string;
      body: string | null;
      pinned: boolean;
      published_at: string;
      scheduled_at: string | null;
    }[];
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      body: row.body ?? undefined,
      pinned: row.pinned,
      publishedAt: row.published_at,
    }));
  } catch (error) {
    console.warn("Neon announcement query unavailable; returning no public announcements.", error);
    return [];
  }
}
