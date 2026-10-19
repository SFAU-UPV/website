alter table programs
  add column if not exists eligibility text[],
  add column if not exists requirements text[],
  add column if not exists benefits text[],
  add column if not exists degree_programs text[],
  add column if not exists application_process text[],
  add column if not exists contact jsonb,
  add column if not exists official_source_url text;

alter table application_cycles
  add column if not exists link_type text check (link_type in ('official-portal', 'google-form', 'other'));

create index if not exists programs_degree_programs_idx on programs using gin (degree_programs);
