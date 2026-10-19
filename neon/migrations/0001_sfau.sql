create extension if not exists pgcrypto;

create type publication_status as enum ('draft', 'published', 'archived');
create type verification_state as enum ('unverified', 'verified');
create type scholarship_category as enum ('up-administered', 'government', 'private');

create table service_categories (
  id uuid primary key default gen_random_uuid(), slug text not null unique,
  name text not null, description text not null default '', created_at timestamptz not null default now()
);
create table programs (
  id uuid primary key default gen_random_uuid(), slug text not null unique,
  name text not null, summary text not null, description text,
  service_category_id uuid references service_categories(id), publication_status publication_status not null default 'draft',
  featured boolean not null default false, display_priority integer, source_status text, eligibility text[] not null default '{}',
  requirements text[] not null default '{}', benefits text[] not null default '{}', degree_programs text[] not null default '{}',
  application_process text[] not null default '{}', contact jsonb, official_source_url text, image_url text,
  document_urls text[] not null default '{}', archived_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'), check (char_length(summary) between 1 and 500),
  check (image_url is null or image_url ~* '^https://'), check (official_source_url is null or official_source_url ~* '^https://')
);
create table scholarship_categories (id uuid primary key default gen_random_uuid(), slug scholarship_category not null unique, name text not null);
create table program_category_links (program_id uuid not null references programs(id) on delete cascade, category_id uuid not null references scholarship_categories(id) on delete cascade, primary key (program_id, category_id));
create table application_cycles (
  id uuid primary key default gen_random_uuid(), program_id uuid not null references programs(id) on delete cascade,
  academic_year text, cycle_label text, verified_open_at timestamptz, close_at timestamptz,
  external_url text, link_type text, verification_state verification_state not null default 'unverified',
  verification_metadata jsonb not null default '{}', admin_override text, archived_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (close_at is null or verified_open_at is null or close_at >= verified_open_at),
  check (external_url is null or external_url ~* '^https://')
);
create table announcements (
  id uuid primary key default gen_random_uuid(), title text not null, summary text not null, body text,
  publication_status publication_status not null default 'draft', published_at timestamptz, scheduled_at timestamptz,
  pinned boolean not null default false, author_id text, archived_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check (char_length(title) between 1 and 240)
);
create table admin_profiles (id text primary key, display_name text not null, role text not null default 'editor' check (role in ('administrator', 'editor')), created_at timestamptz not null default now());
create table audit_logs (id uuid primary key default gen_random_uuid(), actor_id text not null, entity_type text not null, entity_id uuid not null, action text not null, before_data jsonb, after_data jsonb, created_at timestamptz not null default now());
create table import_batches (id uuid primary key default gen_random_uuid(), source_filename text not null, source_sha256 text not null unique, source_columns text[] not null, dry_run boolean not null default true, review_status text not null default 'needs_review', report jsonb not null, created_at timestamptz not null default now());
create table program_source_records (id uuid primary key default gen_random_uuid(), import_batch_id uuid not null references import_batches(id), source_row_number integer not null, source_name text not null, normalized_name text not null, raw_payload jsonb not null, source_status text, review_flags text[] not null default '{}', content_sha256 text not null unique, created_at timestamptz not null default now());

create index programs_admin_listing_idx on programs (publication_status, updated_at desc, name);
create index application_cycles_public_window_idx on application_cycles(program_id, verification_state, verified_open_at, close_at) where archived_at is null;
create index announcements_admin_listing_idx on announcements (publication_status, updated_at desc);
create index audit_logs_entity_created_idx on audit_logs (entity_type, entity_id, created_at desc);
create index programs_degree_programs_idx on programs using gin (degree_programs);

insert into scholarship_categories (slug, name) values
  ('up-administered', 'UP-administered'), ('government', 'Government'), ('private', 'Private')
on conflict (slug) do nothing;

create or replace function touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
create trigger programs_touch_updated_at before update on programs for each row execute function touch_updated_at();
create trigger application_cycles_touch_updated_at before update on application_cycles for each row execute function touch_updated_at();
create trigger announcements_touch_updated_at before update on announcements for each row execute function touch_updated_at();

-- Normal admin workflows archive records. Hard deletes are deliberately blocked.
create or replace function prevent_sfau_delete() returns trigger language plpgsql as $$ begin raise exception 'SFAU records are archived instead of deleted'; end $$;
create trigger prevent_program_delete before delete on programs for each row execute function prevent_sfau_delete();
create trigger prevent_cycle_delete before delete on application_cycles for each row execute function prevent_sfau_delete();
create trigger prevent_announcement_delete before delete on announcements for each row execute function prevent_sfau_delete();
