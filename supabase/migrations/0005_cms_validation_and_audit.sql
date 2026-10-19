-- CMS safety constraints and timestamps. Records remain archive-only.

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists programs_touch_updated_at on programs;
create trigger programs_touch_updated_at before update on programs for each row execute function public.touch_updated_at();
drop trigger if exists announcements_touch_updated_at on announcements;
create trigger announcements_touch_updated_at before update on announcements for each row execute function public.touch_updated_at();

alter table programs drop constraint if exists programs_slug_format_check;
alter table programs add constraint programs_slug_format_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');
alter table programs drop constraint if exists programs_summary_length_check;
alter table programs add constraint programs_summary_length_check check (char_length(summary) between 1 and 500);
alter table programs add column if not exists image_url text;
alter table programs add column if not exists document_urls text[] not null default '{}';
alter table programs drop constraint if exists programs_image_url_protocol_check;
alter table programs add constraint programs_image_url_protocol_check check (image_url is null or image_url ~* '^https://');
alter table application_cycles drop constraint if exists application_cycles_url_protocol_check;
alter table application_cycles add constraint application_cycles_url_protocol_check check (external_url is null or external_url ~* '^https://');
alter table application_cycles drop constraint if exists application_cycles_dates_check;
alter table application_cycles add constraint application_cycles_dates_check check (close_at is null or verified_open_at is null or close_at >= verified_open_at);
alter table announcements drop constraint if exists announcements_title_length_check;
alter table announcements add constraint announcements_title_length_check check (char_length(title) between 1 and 240);

create index if not exists programs_admin_listing_idx on programs (publication_status, updated_at desc, name);
create index if not exists announcements_admin_listing_idx on announcements (publication_status, updated_at desc);
create index if not exists audit_logs_entity_created_idx on audit_logs (entity_type, entity_id, created_at desc);

comment on table audit_logs is 'Protected administrative before/after history. Never expose to public clients.';
