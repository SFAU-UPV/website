-- Manual, review-gated rollback for 0004. Do not run in production without approval.
drop trigger if exists programs_archive_state on programs;
drop trigger if exists announcements_archive_state on announcements;
drop trigger if exists programs_archive_only on programs;
drop trigger if exists application_cycles_archive_only on application_cycles;
drop trigger if exists announcements_archive_only on announcements;
drop trigger if exists program_category_links_archive_only on program_category_links;
drop function if exists public.sync_archive_state();
drop function if exists public.prevent_sfa_hard_delete();
alter table program_category_links drop column if exists archived_at;
