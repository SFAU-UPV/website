-- Administrative removal is archive-only. These guards make that rule hold
-- even if a future server action or elevated client accidentally issues DELETE.

create or replace function public.prevent_sfa_hard_delete()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  raise exception 'Hard delete is disabled for %. Archive the record instead.', TG_TABLE_NAME
    using errcode = 'restrict_violation';
end;
$$;

create or replace function public.sync_archive_state()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.archived_at is not null then
    new.publication_status := 'archived';
  elsif new.publication_status = 'archived' and old.publication_status <> 'archived' then
    new.archived_at := coalesce(new.archived_at, now());
  end if;
  return new;
end;
$$;

alter table program_category_links
  add column if not exists archived_at timestamptz;

create index if not exists program_category_links_active_idx
  on program_category_links(program_id, category_id)
  where archived_at is null;

drop policy if exists "public can read published category links" on program_category_links;
create policy "public can read published category links" on program_category_links
  for select to anon, authenticated
  using (archived_at is null and exists (
    select 1 from programs
    where programs.id = program_id
      and programs.publication_status = 'published'
      and programs.archived_at is null
  ));

revoke select on table program_category_links from anon, authenticated;
grant select (program_id, category_id) on table program_category_links to anon, authenticated;

comment on column program_category_links.archived_at is 'Soft-delete timestamp for retiring a category assignment without deleting history.';

drop trigger if exists programs_archive_state on programs;
create trigger programs_archive_state before update on programs for each row execute function public.sync_archive_state();
drop trigger if exists announcements_archive_state on announcements;
create trigger announcements_archive_state before update on announcements for each row execute function public.sync_archive_state();

drop trigger if exists programs_archive_only on programs;
create trigger programs_archive_only before delete on programs for each row execute function public.prevent_sfa_hard_delete();
drop trigger if exists application_cycles_archive_only on application_cycles;
create trigger application_cycles_archive_only before delete on application_cycles for each row execute function public.prevent_sfa_hard_delete();
drop trigger if exists announcements_archive_only on announcements;
create trigger announcements_archive_only before delete on announcements for each row execute function public.prevent_sfa_hard_delete();
drop trigger if exists program_category_links_archive_only on program_category_links;
create trigger program_category_links_archive_only before delete on program_category_links for each row execute function public.prevent_sfa_hard_delete();

comment on column programs.archived_at is 'Soft-delete timestamp; normal admin removal sets this and publication_status=archived.';
comment on column application_cycles.archived_at is 'Soft-delete timestamp; historical cycles remain available to administrators.';
comment on column announcements.archived_at is 'Soft-delete timestamp; archived announcements are excluded from public reads.';
