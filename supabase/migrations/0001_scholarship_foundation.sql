create extension if not exists pgcrypto;

create type publication_status as enum ('draft', 'published', 'archived');
create type application_status as enum ('unverified', 'upcoming', 'open', 'closed', 'suspended');
create type scholarship_category as enum ('up-administered', 'government', 'private');

create table service_categories (id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null, description text not null, created_at timestamptz not null default now());
create table programs (id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null, summary text not null, description text, service_category_id uuid references service_categories(id), publication_status publication_status not null default 'draft', featured boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table scholarship_categories (id uuid primary key default gen_random_uuid(), slug scholarship_category not null unique, name text not null);
create table program_category_links (program_id uuid not null references programs(id) on delete cascade, category_id uuid not null references scholarship_categories(id) on delete cascade, primary key (program_id, category_id));
create table application_cycles (id uuid primary key default gen_random_uuid(), program_id uuid not null references programs(id) on delete cascade, starts_on date, ends_on date, verification_status application_status not null default 'unverified', override_status application_status, external_application_url text, verified_at timestamptz, created_at timestamptz not null default now(), check (ends_on is null or starts_on is null or ends_on >= starts_on));
create table announcements (id uuid primary key default gen_random_uuid(), title text not null, summary text not null, body text, publication_status publication_status not null default 'draft', published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table admin_profiles (id uuid primary key references auth.users(id) on delete cascade, display_name text not null, role text not null default 'editor', created_at timestamptz not null default now());
create table audit_logs (id uuid primary key default gen_random_uuid(), actor_id uuid references auth.users(id), entity_type text not null, entity_id uuid not null, action text not null, before_data jsonb, after_data jsonb, created_at timestamptz not null default now());

create index programs_publication_status_idx on programs(publication_status);
create index application_cycles_program_id_idx on application_cycles(program_id);
alter table programs enable row level security;
alter table announcements enable row level security;
create policy "public can read published programs" on programs for select using (publication_status = 'published');
create policy "public can read published announcements" on announcements for select using (publication_status = 'published');
