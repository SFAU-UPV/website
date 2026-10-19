-- Representative Supabase SQL checks for the public read surface.
-- Run after `npx supabase db reset` or `npx supabase db push`.

-- Published public programs only. Expected: zero rows with draft/archived status.
select id, slug, name, publication_status
from public.programs
where publication_status <> 'published' and archived_at is null;

-- Public cycles must be verified and attached to published programs.
select c.id, c.program_id, c.verification_state, c.external_url
from public.application_cycles c
join public.programs p on p.id = c.program_id
where c.verification_state <> 'verified'
   or p.publication_status <> 'published';

-- Scheduled or unpublished announcements must not appear in the public query.
select id, title, publication_status, scheduled_at
from public.announcements
where publication_status <> 'published'
   or (scheduled_at is not null and scheduled_at > now());

-- The public cycle grant intentionally excludes verification_metadata and admin notes.
-- Confirm by selecting through the anon/authenticated API rather than the service role.
