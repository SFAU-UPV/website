# UP Visayas SFAU website

Public information site foundation for the Scholarships and Financial Assistance Unit (SFAU), Office of Student Affairs, University of the Philippines Visayas.

## Requirements

- Node.js 20 LTS or newer
- npm 10 or newer
- PostgreSQL/Supabase for later data-backed phases

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

When Supabase is configured:

```bash
npx supabase start
npx supabase db reset
npx supabase db push
```

The seed file contains only the six approved service groups and three scholarship categories. Scholarship records are intentionally not seeded until SFAU verifies the supplied CSV and PDF values.

For a local rollback during development, use `npx supabase db reset` to rebuild from migrations. Production rollback is manual and review-gated; inspect the migration before applying the corresponding reverse SQL rather than deleting records. Normal admin workflows archive records instead of hard-deleting them. Migration `0004_archive_only_guards.sql` also blocks hard deletes at the database trigger level and synchronizes `archived_at` with the `archived` publication state.

## Source-data import

The importer reads the exact scholarship CSV columns and defaults to dry-run. It preserves raw source payloads, generates stable IDs/slugs, detects duplicates and category references, flags instructions such as `Apply directly at CHED` or `SIKAP` as non-proof of availability, and creates no application cycles.

```bash
node scripts/import-scholarships.mjs --input "C:\Users\Lenovo\Downloads\UP Visayas List of Scholarships - Sheet1.csv" --report reports/scholarship-import-report.json
```

After the dry-run report is reviewed and an administrator approves the import:

```bash
node scripts/import-scholarships.mjs --input "C:\Users\Lenovo\Downloads\UP Visayas List of Scholarships - Sheet1.csv" --report reports/scholarship-import-report.json --apply
```

`--apply` requires `SUPABASE_SERVICE_ROLE_KEY` and must run in a trusted server/CLI environment. It creates draft programs and provenance records only; application links and cycles remain unverified until SFAU adds them.

## Conventions

Use Server Components by default, keep public content server-filtered, validate all admin inputs at the boundary, and record administrative changes. Use stable kebab-case slugs. Never infer an open application from the source CSV alone. Keep secrets in environment variables and never commit `.env.local`.

## Roadmap

1. Foundation, visual system, routes, domain plan, and initial migration.
2. Supabase schema integration, seeded verified source data, and admin authentication.
3. Admin CRUD for programs, cycles, links, announcements, and audit history.
4. Accessibility and end-to-end coverage, deployment documentation, and SFAU staff handoff.

See [`docs/ADR-0001-foundation.md`](docs/ADR-0001-foundation.md) for the architecture decision record.
