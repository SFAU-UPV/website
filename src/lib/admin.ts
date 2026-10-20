"use server";

import { revalidatePath } from "next/cache";
import { auth, isNeonAuthConfigured } from "@/src/lib/auth/server";
import { getNeonSql, isNeonConfigured } from "@/src/lib/neon/db";

export type AdminActionState = {
  ok: boolean;
  message?: string;
  error?: string;
  program?: Record<string, unknown>;
};
type Row = Record<string, unknown>;
type Sql = ReturnType<typeof getNeonSql>;
const emptyState: AdminActionState = { ok: false };
const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const list = (form: FormData, key: string) =>
  text(form, key)
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
const nullable = (value: string) => value || null;
function sanitize(value: string) {
  return value
    .replace(/<\/?(script|style|iframe|object|embed|form)[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*(["']).*?\1/gi, "")
    .replace(/javascript\s*:/gi, "")
    .trim();
}
function httpsUrl(value: string, label: string) {
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid HTTPS URL.`);
  }
  if (url.protocol !== "https:") throw new Error(`${label} must use HTTPS.`);
  const trusted = (process.env.SFAU_TRUSTED_EXTERNAL_ORIGINS ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (trusted.length && !trusted.includes(url.origin))
    throw new Error(`${label} is not from a configured trusted origin.`);
  return url.toString();
}
function requireNeon() {
  if (!isNeonConfigured())
    throw new Error("Neon DATABASE_URL is not configured. CMS writes are disabled.");
  if (!isNeonAuthConfigured)
    throw new Error(
      "Neon Auth is not configured. Set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET.",
    );
  return getNeonSql();
}
async function requireAdmin() {
  const sql = requireNeon();
  const result = await (
    auth as { getSession: () => Promise<{ data?: { user?: { id?: string } } }> }
  ).getSession();
  const user = result?.data?.user;
  if (!user?.id) throw new Error("Your administrator session has expired. Sign in again.");
  const profiles = (await sql.query(
    "select id, display_name, role from admin_profiles where id = $1 and role in ('administrator', 'editor') limit 1",
    [String(user.id)],
  )) as unknown as Row[];
  if (!profiles[0]) throw new Error("You are not authorized to manage SFAU content.");
  return { sql, user, profile: profiles[0] };
}
async function audit(
  sql: Sql,
  actorId: string,
  entityType: string,
  entityId: string,
  action: string,
  beforeData: Row | null,
  afterData: Row | null,
) {
  await sql.query(
    "insert into audit_logs (actor_id, entity_type, entity_id, action, before_data, after_data) values ($1, $2, $3, $4, $5::jsonb, $6::jsonb)",
    [actorId, entityType, entityId, action, JSON.stringify(beforeData), JSON.stringify(afterData)],
  );
}
function programPayload(form: FormData) {
  const name = text(form, "name"),
    slug = text(form, "slug").toLowerCase(),
    description = nullable(sanitize(text(form, "description")));
  if (!name || !slug) throw new Error("Name and slug are required.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw new Error("Slug must use lowercase letters, numbers, and hyphens only.");
  return {
    name,
    slug,
    description,
    // The database requires a nonempty, at-most-500-character summary.
    summary: (description ?? name).slice(0, 500),
    service_category_id: nullable(text(form, "service_category_id")),
    publication_status: ["draft", "published", "archived"].includes(
      text(form, "publication_status"),
    )
      ? text(form, "publication_status")
      : "draft",
    featured: form.get("featured") === "on",
    display_priority: Number(text(form, "display_priority")) || null,
    eligibility: list(form, "eligibility").map(sanitize),
    requirements: list(form, "requirements").map(sanitize),
    benefits: list(form, "benefits").map(sanitize),
    degree_programs: list(form, "degree_programs"),
    application_process: list(form, "application_process").map(sanitize),
    application_url: httpsUrl(text(form, "application_url"), "Application link"),
  };
}

export async function getAdminSnapshot() {
  const { sql } = await requireAdmin();
  const [programs, announcements, services, categories, audits] = await Promise.all([
    sql.query(
      "select p.*, sc.slug as service_slug, sc.name as service_name, coalesce(array_agg(distinct sh.slug) filter (where sh.slug is not null), '{}') as category_slugs, coalesce(jsonb_agg(distinct ac) filter (where ac.id is not null), '[]') as application_cycles from programs p left join service_categories sc on sc.id=p.service_category_id left join program_category_links pcl on pcl.program_id=p.id left join scholarship_categories sh on sh.id=pcl.category_id left join application_cycles ac on ac.program_id=p.id and ac.archived_at is null group by p.id, sc.slug, sc.name order by p.updated_at desc",
    ),
    sql.query(
      "select id,title,summary,body,publication_status,published_at,scheduled_at,pinned,updated_at,archived_at from announcements order by updated_at desc",
    ),
    sql.query("select id,slug,name from service_categories order by name"),
    sql.query("select id,slug,name from scholarship_categories order by name"),
    sql.query(
      "select id,entity_type,entity_id,action,created_at,actor_id,before_data,after_data from audit_logs order by created_at desc limit 30",
    ),
  ]);
  return { programs, announcements, services, categories, audits };
}
export async function getAdminProgramPreview(id: string) {
  const { sql } = await requireAdmin();
  const rows = await sql.query(
    "select p.*, sc.name as service_name, coalesce(array_agg(distinct sh.name) filter (where sh.name is not null), '{}') as category_names from programs p left join service_categories sc on sc.id=p.service_category_id left join program_category_links pcl on pcl.program_id=p.id left join scholarship_categories sh on sh.id=pcl.category_id where p.id=$1 group by p.id, sc.name",
    [id],
  );
  if (!rows[0]) throw new Error("Program preview not found.");
  return rows[0];
}
export async function saveProgramAction(
  _previous: AdminActionState = emptyState,
  form: FormData,
): Promise<AdminActionState> {
  try {
    const { sql, user } = await requireAdmin();
    const id = text(form, "id"),
      payload = programPayload(form);
    let rows: Row[];
    const params = [
      payload.name,
      payload.slug,
      payload.summary,
      payload.description,
      payload.service_category_id,
      payload.publication_status,
      payload.featured,
      payload.display_priority,
      payload.eligibility,
      payload.requirements,
      payload.benefits,
      payload.degree_programs,
      payload.application_process,
      null,
      null,
      [],
    ];
    if (id)
      rows = await sql.query(
        "update programs set name=$1,slug=$2,summary=$3,description=$4,service_category_id=$5,publication_status=$6::publication_status,featured=$7,display_priority=$8,eligibility=$9,requirements=$10,benefits=$11,degree_programs=$12,application_process=$13,official_source_url=$14,image_url=$15,document_urls=$16,updated_at=now(),archived_at=case when $6::publication_status='archived' then coalesce(archived_at, now()) else null end where id=$17 returning *",
        [...params, id],
      );
    else
      rows = await sql.query(
        "insert into programs (name,slug,summary,description,service_category_id,publication_status,featured,display_priority,eligibility,requirements,benefits,degree_programs,application_process,official_source_url,image_url,document_urls) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) returning *",
        params,
      );
    if (!rows[0]) throw new Error("Program could not be saved.");
    const categories = text(form, "category_slugs")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    await sql.query("delete from program_category_links where program_id=$1", [rows[0].id]);
    if (categories.length)
      await sql.query(
        "insert into program_category_links (program_id, category_id) select $1, id from scholarship_categories where slug = any($2::text[]) on conflict do nothing",
        [rows[0].id, categories],
      );
    const cycle = (
      await sql.query(
        "select id from application_cycles where program_id=$1 and archived_at is null order by updated_at desc limit 1",
        [rows[0].id],
      )
    )[0];
    if (cycle)
      await sql.query(
        "update application_cycles set external_url=$1, updated_at=now() where id=$2",
        [payload.application_url, cycle.id],
      );
    else if (payload.application_url)
      await sql.query("insert into application_cycles (program_id, external_url) values ($1, $2)", [
        rows[0].id,
        payload.application_url,
      ]);
    await audit(
      sql,
      String(user.id),
      "program",
      String(rows[0].id),
      id ? "updated" : "created",
      null,
      { id: rows[0].id, name: rows[0].name, publication_status: rows[0].publication_status },
    );
    const updatedProgram = (
      await sql.query(
        "select p.*, coalesce(array_agg(distinct sh.slug) filter (where sh.slug is not null), '{}') as category_slugs, coalesce(jsonb_agg(distinct ac) filter (where ac.id is not null), '[]') as application_cycles from programs p left join program_category_links pcl on pcl.program_id=p.id left join scholarship_categories sh on sh.id=pcl.category_id left join application_cycles ac on ac.program_id=p.id and ac.archived_at is null where p.id=$1 group by p.id",
        [rows[0].id],
      )
    )[0];
    if (!updatedProgram) throw new Error("Saved program could not be reloaded.");
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath("/services/scholarships");
    revalidatePath("/services/other-financial-assistance");
    revalidatePath("/services/student-assistantship");
    return {
      ok: true,
      message: id ? "Program updated." : "Program saved as draft.",
      program: updatedProgram,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Program could not be saved.",
    };
  }
}
export async function changeProgramStateAction(form: FormData): Promise<AdminActionState> {
  try {
    const { sql, user } = await requireAdmin();
    const id = text(form, "id"),
      next = text(form, "next_status");
    if (!id || !["draft", "published", "archived"].includes(next))
      throw new Error("Invalid program state change.");
    const before = (
      await sql.query(
        "select id,name,slug,publication_status,archived_at from programs where id=$1",
        [id],
      )
    )[0];
    if (!before) throw new Error("Program not found.");
    const after = (
      await sql.query(
        "update programs set publication_status=$1::publication_status, archived_at=case when $1::publication_status='archived' then coalesce(archived_at, now()) else null end, updated_at=now() where id=$2 returning id,name,slug,publication_status,archived_at",
        [next, id],
      )
    )[0];
    await audit(
      sql,
      String(user.id),
      "program",
      id,
      next === "archived" ? "archived" : next === "published" ? "published" : "unpublished",
      before,
      after,
    );
    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath("/services/scholarships");
    revalidatePath(`/services/scholarships/${before.slug}`);
    return { ok: true, message: `Program ${next}.` };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Program state could not be changed.",
    };
  }
}
export async function saveCycleAction(
  _previous: AdminActionState = emptyState,
  form: FormData,
): Promise<AdminActionState> {
  try {
    const { sql, user } = await requireAdmin();
    const id = text(form, "id"),
      programId = text(form, "program_id"),
      starts = text(form, "verified_open_at"),
      closes = text(form, "close_at");
    if (!programId) throw new Error("Choose a program.");
    if (starts && closes && closes < starts)
      throw new Error("Close date must be on or after the opening date.");
    const url = httpsUrl(text(form, "external_url"), "Application URL");
    const values = [
      programId,
      nullable(text(form, "academic_year")),
      nullable(text(form, "cycle_label")),
      starts || null,
      closes || null,
      url,
      text(form, "link_type") || null,
      text(form, "verification_state") === "verified" ? "verified" : "unverified",
      text(form, "admin_override") || null,
    ];
    const row = id
      ? (
          await sql.query(
            "update application_cycles set program_id=$1,academic_year=$2,cycle_label=$3,verified_open_at=$4,close_at=$5,external_url=$6,link_type=$7,verification_state=$8,admin_override=$9,updated_at=now() where id=$10 returning *",
            [...values, id],
          )
        )[0]
      : (
          await sql.query(
            "insert into application_cycles (program_id,academic_year,cycle_label,verified_open_at,close_at,external_url,link_type,verification_state,admin_override) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *",
            values,
          )
        )[0];
    if (!row) throw new Error("Application cycle could not be saved.");
    await audit(
      sql,
      String(user.id),
      "application_cycle",
      String(row.id),
      id ? "updated" : "created",
      null,
      { id: row.id, program_id: programId, verification_state: row.verification_state },
    );
    revalidatePath("/");
    revalidatePath("/services/scholarships");
    return { ok: true, message: id ? "Application cycle updated." : "Application cycle created." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Application cycle could not be saved.",
    };
  }
}
export async function saveAnnouncementAction(
  _previous: AdminActionState = emptyState,
  form: FormData,
): Promise<AdminActionState> {
  try {
    const { sql, user } = await requireAdmin();
    const id = text(form, "id"),
      title = text(form, "title"),
      summary = text(form, "summary");
    if (!title || !summary) throw new Error("Title and summary are required.");
    const values = [
      title,
      summary,
      nullable(sanitize(text(form, "body"))),
      text(form, "publication_status") || "draft",
      form.get("pinned") === "on",
    ];
    const row = id
      ? (
          await sql.query(
            "update announcements set title=$1,summary=$2,body=$3,publication_status=$4,pinned=$5,updated_at=now() where id=$6 returning *",
            [...values, id],
          )
        )[0]
      : (
          await sql.query(
            "insert into announcements (title,summary,body,publication_status,pinned) values ($1,$2,$3,$4,$5) returning *",
            values,
          )
        )[0];
    if (!row) throw new Error("Announcement could not be saved.");
    await audit(
      sql,
      String(user.id),
      "announcement",
      String(row.id),
      id ? "updated" : "created",
      null,
      { id: row.id, title: row.title, publication_status: row.publication_status },
    );
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true, message: id ? "Announcement updated." : "Announcement saved." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Announcement could not be saved.",
    };
  }
}
export async function changeAnnouncementStateAction(form: FormData): Promise<AdminActionState> {
  try {
    const { sql, user } = await requireAdmin();
    const id = text(form, "id"),
      next = text(form, "next_status");
    if (!id || !["draft", "published", "archived"].includes(next))
      throw new Error("Invalid announcement state change.");
    const before = (
      await sql.query(
        "select id,title,publication_status,archived_at from announcements where id=$1",
        [id],
      )
    )[0];
    if (!before) throw new Error("Announcement not found.");
    const after = (
      await sql.query(
        "update announcements set publication_status=$1::publication_status, archived_at=case when $1::publication_status='archived' then coalesce(archived_at, now()) else null end, published_at=case when $1::publication_status='published' then coalesce(published_at, now()) else published_at end, updated_at=now() where id=$2 returning id,title,publication_status,archived_at,published_at",
        [next, id],
      )
    )[0];
    await audit(
      sql,
      String(user.id),
      "announcement",
      id,
      next === "archived" ? "archived" : next === "published" ? "published" : "unpublished",
      before,
      after,
    );
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true, message: `Announcement ${next}.` };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Announcement state could not be changed.",
    };
  }
}
