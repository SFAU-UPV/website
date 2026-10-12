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

## Conventions

Use Server Components by default, keep public content server-filtered, validate all admin inputs at the boundary, and record administrative changes. Use stable kebab-case slugs. Never infer an open application from the source CSV alone. Keep secrets in environment variables and never commit `.env.local`.

## Roadmap

1. Foundation, visual system, routes, domain plan, and initial migration.
2. Supabase schema integration, seeded verified source data, and admin authentication.
3. Admin CRUD for programs, cycles, links, announcements, and audit history.
4. Accessibility and end-to-end coverage, deployment documentation, and SFAU staff handoff.

See [`docs/ADR-0001-foundation.md`](docs/ADR-0001-foundation.md) for the architecture decision record.
