-- Manual, review-gated rollback for migration 0003.
-- Do not run in production without a backup and an explicit approval.
begin;

drop policy if exists "public can read published programs" on programs;
drop policy if exists "public can read published announcements" on announcements;
drop function if exists public.is_sfa_admin();
drop table if exists program_source_records;
drop table if exists import_batches;

alter table application_cycles drop column if exists academic_year;
alter table application_cycles drop column if exists cycle_label;
alter table application_cycles drop column if exists verified_open_at;
alter table application_cycles drop column if exists close_at;
alter table application_cycles drop column if exists external_url;
alter table application_cycles drop column if exists verification_state;
alter table application_cycles drop column if exists verification_metadata;
alter table application_cycles drop column if exists admin_override;
alter table application_cycles drop column if exists archived_at;
alter table programs drop column if exists display_priority;
alter table programs drop column if exists source_status;
alter table programs drop column if exists archived_at;
alter table announcements drop column if exists scheduled_at;
alter table announcements drop column if exists pinned;
alter table announcements drop column if exists author_id;
alter table announcements drop column if exists archived_at;

commit;
