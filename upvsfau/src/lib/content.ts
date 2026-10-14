import { programs as fixturePrograms, services, servicePrograms, type ApplicationCycle, type ApplicationLinkType, type Program, type ServiceCategory } from "@/src/types/domain";
import { createSupabasePublicClient } from "@/src/lib/supabase/public";
import { isSupabaseConfigured } from "@/src/lib/supabase/server";

export interface Announcement { id: string; title: string; summary: string; body?: string; pinned: boolean; publishedAt: string; fixtureLabel?: "STATIC MOCK FIXTURE"; }
export interface AnnouncementFixture extends Announcement { fixtureLabel: "STATIC MOCK FIXTURE"; }

const fixtureAnnouncements: AnnouncementFixture[] = [
  { id: "mock-announcement-001", title: "SFAU information hub preview", summary: "This announcement row is a static fixture for the public layout and will be replaced by verified SFAU content.", publishedAt: "Preview fixture", pinned: false, fixtureLabel: "STATIC MOCK FIXTURE" },
  { id: "mock-announcement-002", title: "Application availability requires verification", summary: "Published directory records do not imply an open application cycle.", publishedAt: "Preview fixture", pinned: false, fixtureLabel: "STATIC MOCK FIXTURE" },
];

type DbProgram = { id: string; slug: string; name: string; summary: string; description: string | null; publication_status: "draft" | "published" | "archived"; featured: boolean; display_priority: number | null; eligibility: string[] | null; requirements: string[] | null; benefits: string[] | null; degree_programs: string[] | null; application_process: string[] | null; contact: unknown; official_source_url: string | null; service_categories?: { slug: string } | null; program_category_links?: { scholarship_categories?: { slug: "up-administered" | "government" | "private" } | null }[]; application_cycles?: DbCycle[] };
type DbCycle = { id: string; program_id: string; academic_year: string | null; cycle_label: string | null; verified_open_at: string | null; close_at: string | null; external_url: string | null; link_type: ApplicationLinkType | null; verification_state: "unverified" | "verified"; verification_metadata: unknown; admin_override: ApplicationCycle["statusOverride"] | null };

function safeContact(value: unknown) { return Array.isArray(value) ? value.filter((item): item is { label: string; value: string; href?: string } => Boolean(item && typeof item === "object" && "label" in item && "value" in item && typeof item.label === "string" && typeof item.value === "string")) : undefined; }
function mapCycle(row: DbCycle): ApplicationCycle { const openDate = row.verified_open_at?.slice(0, 10) ?? null; const closeDate = row.close_at?.slice(0, 10) ?? null; return { id: row.id, programId: row.program_id, startsOn: openDate, endsOn: closeDate, declaredAvailability: row.admin_override ?? (row.verification_state === "verified" && openDate ? "open" : "unverified"), verificationStatus: row.verification_state, externalApplicationUrl: row.external_url ?? undefined, linkType: row.link_type ?? undefined, statusOverride: row.admin_override ?? undefined }; }
function mapProgram(row: DbProgram): Program { const linkedCategories = row.program_category_links?.flatMap((link) => link.scholarship_categories?.slug ? [link.scholarship_categories.slug] : []) ?? []; const category = linkedCategories[0] ?? "up-administered"; return { id: row.id, slug: row.slug, name: row.name, summary: row.summary, description: row.description ?? undefined, category, categories: linkedCategories.slice(1), serviceSlug: row.service_categories?.slug ?? "scholarships", publicationStatus: row.publication_status, degreePrograms: row.degree_programs ?? undefined, eligibility: row.eligibility ?? undefined, requirements: row.requirements ?? undefined, benefits: row.benefits ?? undefined, applicationProcess: row.application_process ?? undefined, contact: safeContact(row.contact), officialSourceUrl: row.official_source_url ?? undefined, cycles: row.application_cycles?.filter((cycle) => cycle.verification_state === "verified").map(mapCycle) }; }

export function getPublicServices(): ServiceCategory[] { return services; }

export async function getPublicPrograms(): Promise<Program[]> {
  "use cache";
  if (!isSupabaseConfigured()) return fixturePrograms.filter((program) => program.publicationStatus === "published");
  try { const supabase = createSupabasePublicClient(); const { data, error } = await supabase.from("programs").select("id,slug,name,summary,description,publication_status,featured,display_priority,eligibility,requirements,benefits,degree_programs,application_process,contact,official_source_url,service_categories(slug),program_category_links(scholarship_categories(slug)),application_cycles(id,program_id,academic_year,cycle_label,verified_open_at,close_at,external_url,link_type,verification_state,verification_metadata,admin_override)").eq("publication_status", "published").order("display_priority", { ascending: false, nullsFirst: false }).order("name"); if (error) throw error; return (data as unknown as DbProgram[]).map(mapProgram); } catch (error) { console.warn("Public program query unavailable; using clearly marked local fixtures.", error); return fixturePrograms.filter((program) => program.publicationStatus === "published"); }
}

export async function getPublicServiceProgram(slug: string): Promise<Program | undefined> { const databasePrograms = await getPublicPrograms(); return [...databasePrograms, ...servicePrograms].find((program) => program.slug === slug && program.publicationStatus === "published"); }

export async function getPublicAnnouncements(): Promise<Announcement[]> {
  "use cache";
  if (!isSupabaseConfigured()) return fixtureAnnouncements;
  try { const supabase = createSupabasePublicClient(); const { data, error } = await supabase.from("announcements").select("id,title,summary,body,publication_status,scheduled_at,pinned,author_id,created_at,updated_at").eq("publication_status", "published").order("pinned", { ascending: false }).order("created_at", { ascending: false }); if (error) throw error; const now = Date.now(); return (data ?? []).filter((row) => !row.scheduled_at || new Date(row.scheduled_at).getTime() <= now).map((row) => ({ id: row.id, title: row.title, summary: row.summary, body: row.body ?? undefined, pinned: row.pinned, publishedAt: row.created_at })); } catch (error) { console.warn("Public announcement query unavailable; using clearly marked local fixtures.", error); return fixtureAnnouncements; }
}
