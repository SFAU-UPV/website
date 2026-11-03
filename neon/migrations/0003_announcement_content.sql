update announcements
set body = summary
where nullif(btrim(body), '') is null and nullif(btrim(summary), '') is not null;
