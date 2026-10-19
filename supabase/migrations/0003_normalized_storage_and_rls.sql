create type verification_state as enum ('unverified', 'verified');
create type admin_role as enum ('administrator', 'editor');

alter table programs
  add column if not exists display_priority integer,
  add column if not exists source_status text,
  add column if not exists archived_at timestamptz;

alter table application_cycles
  add column if not exists academic_year text,
  add column if not exists cycle_label text,
  add column if not exists verified_open_at timestamptz,
  add column if not exists close_at timestamptz,
  add column if not exists external_url text,
  add column if not exists verification_state verification_state not null default 'unverified',
  add column if not exists verification_metadata jsonb,
  add column if not exists admin_override text check (admin_override in ('upcoming', 'open', 'closed', 'suspended')),
  add column if not exists archived_at timestamptz;

create unique index if not exists application_cycles_program_year_label_idx on application_cycles(program_id, academic_year, cycle_label) where academic_year is not null and cycle_label is not null;
create index if not exists application_cycles_public_window_idx on application_cycles(program_id, verification_state, verified_open_at, close_at) where archived_at is null;
create index if not exists programs_display_priority_idx on programs(display_priority desc nulls last, name);

alter table announcements
  add column if not exists scheduled_at timestamptz,
  add column if not exists pinned boolean not null default false,
  add column if not exists author_id uuid references admin_profiles(id),
  add column if not exists archived_at timestamptz;

alter table admin_profiles alter column role drop default;
alter table admin_profiles alter column role type admin_role using case when role in ('administrator', 'admin') then 'administrator'::admin_role else 'editor'::admin_role end;
alter table admin_profiles alter column role set default 'editor'::admin_role;

create table if not exists import_batches (
  id uuid primary key default gen_random_uuid(),
  source_filename text not null,
  source_sha256 text not null unique,
  source_columns jsonb not null,
  dry_run boolean not null default true,
  review_status text not null default 'needs_review' check (review_status in ('needs_review', 'approved', 'applied')),
  report jsonb not null default '{}'::jsonb,
  created_by uuid references admin_profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists program_source_records (
  id uuid primary key default gen_random_uuid(),
  import_batch_id uuid not null references import_batches(id) on delete cascade,
  source_row_number integer not null,
  source_name text not null,
  normalized_name text not null,
  raw_payload jsonb not null,
  source_status text,
  review_flags text[] not null default '{}',
  content_sha256 text not null unique,
  created_at timestamptz not null default now(),
  unique(import_batch_id, source_row_number)
);

alter table import_batches enable row level security;
alter table program_source_records enable row level security;
alter table service_categories enable row level security;
alter table scholarship_categories enable row level security;
alter table program_category_links enable row level security;
alter table application_cycles enable row level security;
alter table admin_profiles enable row level security;
alter table audit_logs enable row level security;

create or replace function public.is_sfa_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_profiles where id = auth.uid() and role in ('administrator', 'editor'));
$$;

drop policy if exists "public can read published programs" on programs;
drop policy if exists "public can read published announcements" on announcements;
create policy "public can read published programs" on programs for select to anon, authenticated using (publication_status = 'published' and archived_at is null);
create policy "public can read published announcements" on announcements for select to anon, authenticated using (publication_status = 'published' and archived_at is null and (scheduled_at is null or scheduled_at <= now()));
create policy "public can read service categories" on service_categories for select to anon, authenticated using (true);
create policy "public can read scholarship categories" on scholarship_categories for select to anon, authenticated using (true);
create policy "public can read published category links" on program_category_links for select to anon, authenticated using (exists (select 1 from programs where programs.id = program_id and programs.publication_status = 'published' and programs.archived_at is null));
create policy "public can read approved cycles" on application_cycles for select to anon, authenticated using (verification_state = 'verified' and archived_at is null and exists (select 1 from programs where programs.id = program_id and programs.publication_status = 'published' and programs.archived_at is null));

create policy "admins can manage programs" on programs for insert to authenticated with check (public.is_sfa_admin());
create policy "admins can update programs" on programs for update to authenticated using (public.is_sfa_admin()) with check (public.is_sfa_admin());
create policy "admins can manage category links" on program_category_links for insert to authenticated with check (public.is_sfa_admin());
create policy "admins can update category links" on program_category_links for update to authenticated using (public.is_sfa_admin()) with check (public.is_sfa_admin());
create policy "admins can manage cycles" on application_cycles for insert to authenticated with check (public.is_sfa_admin());
create policy "admins can update cycles" on application_cycles for update to authenticated using (public.is_sfa_admin()) with check (public.is_sfa_admin());
create policy "admins can manage announcements" on announcements for insert to authenticated with check (public.is_sfa_admin());
create policy "admins can update announcements" on announcements for update to authenticated using (public.is_sfa_admin()) with check (public.is_sfa_admin());
create policy "admins can read import batches" on import_batches for select to authenticated using (public.is_sfa_admin());
create policy "admins can create import batches" on import_batches for insert to authenticated with check (public.is_sfa_admin());
create policy "admins can read source records" on program_source_records for select to authenticated using (public.is_sfa_admin());
create policy "admins can create source records" on program_source_records for insert to authenticated with check (public.is_sfa_admin());
create policy "admins can read audit logs" on audit_logs for select to authenticated using (public.is_sfa_admin());
create policy "admins can write audit logs" on audit_logs for insert to authenticated with check (public.is_sfa_admin());
create policy "admins can read own profile" on admin_profiles for select to authenticated using (id = auth.uid() or public.is_sfa_admin());

revoke all on table import_batches, program_source_records, audit_logs, admin_profiles from anon, authenticated;
revoke all on table application_cycles, announcements from anon, authenticated;
revoke delete on table programs, program_category_links, application_cycles, announcements from authenticated;
grant select on table programs to anon, authenticated;
grant select on table service_categories, scholarship_categories, program_category_links to anon, authenticated;
grant select (id, program_id, academic_year, cycle_label, verified_open_at, close_at, external_url, link_type, verification_state, admin_override) on table application_cycles to anon, authenticated;
grant select (id, title, summary, body, publication_status, scheduled_at, pinned, created_at, updated_at) on table announcements to anon, authenticated;
grant select, insert on table import_batches, program_source_records, audit_logs to authenticated;
grant select on table admin_profiles to authenticated;
grant insert, update on table programs, program_category_links, application_cycles, announcements to authenticated;
