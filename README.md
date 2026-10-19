# UP Visayas SFAU website

Public information site foundation for the Scholarships and Financial Assistance Unit (SFAU), Office of Student Affairs, University of the Philippines Visayas.

## Requirements

- Node.js 20 LTS or newer
- npm 10 or newer
- Neon Postgres and Managed Neon Auth

## Local development

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The current phase uses typed placeholder data and intentionally does not make current-availability claims.

## Commands

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

When Neon is linked:

```bash
neon deploy
neon env pull
psql "$DATABASE_URL_UNPOOLED" -f neon/migrations/0001_sfau.sql
```

## SFAU CMS

Apply `neon/migrations/0001_sfau.sql` with the direct/unpooled connection. Set `SFAU_TRUSTED_EXTERNAL_ORIGINS` in the server environment to a comma-separated list of approved HTTPS origins when the unit wants to restrict application, document, and image links. Neon Auth supplies the administrator session; the app never exposes `DATABASE_URL` to the browser.

Create or invite the administrator in Neon Auth, then insert the matching Neon Auth user ID into `admin_profiles` with role `administrator` or `editor`. Open `/admin/login`; the CMS fails closed when the account is not present in `admin_profiles`.

### Administrative SOP

1. Sign in at `/admin/login` with the approved Neon Auth administrator account.
2. In **Programs**, add a record with a stable lowercase slug, map its service and scholarship categories, enter one item per line for list content, and save it as a draft.
3. Use the program editor to review the preview-equivalent content, then use **Publish** only when the public wording is approved. Publishing does not open applications.
4. In **Application cycles**, create a cycle for the academic year. Enter dates in the correct order, choose the link type, add the HTTPS application URL, and select **Verified** only after SFAU verifies the destination and window. Use a hold/close override for a temporary stop. A missing, invalid, unverified, or held cycle cannot expose **Apply Now**.
5. Use **Unpublish**, **Archive**, and **Restore** from the program list. Archive is a soft-delete state; hard deletes are blocked by the database trigger.
6. In **Announcements**, create or edit the title, summary, and content. Save as draft, then publish manually after review. Scheduling is intentionally not enabled because this deployment has no reliable background scheduler; `scheduled_at` remains available for a future infrastructure-backed phase.
7. Review **Audit trail** after material changes. It records the actor, timestamp, action, and minimal before/after data. Audit rows are protected by RLS and are not public content.

CMS validation rejects non-HTTPS URLs, disallowed origins when configured, unsafe rich-text tags/protocols, invalid slugs, duplicate slugs, summaries over 500 characters, and reversed application windows. Restore returns a record to draft so it cannot accidentally become public.

The seed file contains only the six approved service groups and three scholarship categories. Scholarship records are intentionally not seeded until SFAU verifies the supplied CSV and PDF values.

For a local rollback during development, use a disposable Neon branch and reapply `neon/migrations/0001_sfau.sql`. Production rollback is manual and review-gated; inspect the migration before applying the corresponding reverse SQL rather than deleting records. Normal admin workflows archive records instead of hard-deleting them, and the Neon migration blocks hard deletes.

## Source-data import

The importer reads the exact scholarship CSV columns and defaults to dry-run. It preserves raw source payloads, generates stable IDs/slugs, detects duplicates and category references, flags instructions such as `Apply directly at CHED` or `SIKAP` as non-proof of availability, and creates no application cycles.

```bash
node scripts/import-scholarships.mjs --input "C:\Users\Lenovo\Downloads\UP Visayas List of Scholarships - Sheet1.csv" --report reports/scholarship-import-report.json
```

After the dry-run report is reviewed and an administrator approves the import:

```bash
node scripts/import-scholarships.mjs --input "C:\Users\Lenovo\Downloads\UP Visayas List of Scholarships - Sheet1.csv" --report reports/scholarship-import-report.json --apply
```

`--apply` requires `DATABASE_URL_UNPOOLED` (or `DATABASE_URL`) and must run in a trusted CLI environment. It creates draft programs and provenance records only; application links and cycles remain unverified until SFAU adds them.

## Conventions

Use Server Components by default, keep public content server-filtered, validate all admin inputs at the boundary, and record administrative changes. Use stable kebab-case slugs. Never infer an open application from the source CSV alone. Keep secrets in environment variables and never commit `.env.local`.

## Roadmap

1. Foundation, visual system, routes, domain plan, and initial migration.
2. Neon schema integration, seeded verified source data, and Neon Auth administrator authentication.
3. Admin CRUD for programs, cycles, links, announcements, and audit history.
4. Accessibility and end-to-end coverage, deployment documentation, and SFAU staff handoff.

See [`docs/ADR-0001-foundation.md`](docs/ADR-0001-foundation.md) for the architecture decision record.
