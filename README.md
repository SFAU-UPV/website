# UP Visayas OSA-SFAU website

The official information website for the Scholarships and Financial Assistance Unit (SFAU) of the University of the Philippines Visayas Office of Student Affairs. Students can find scholarships, financial assistance, and other support services. Authorized staff use the admin workspace to maintain the published information.

## Website

- **Home:** service links, announcements, and featured published programs.
- **Services:** information about SLAS Online, scholarships, other financial assistance, student assistantship, the SHARE Loan Program, and student insurance.
- **Program directories and search:** browse or filter published scholarships and financial assistance by name, degree program, administering category, and application availability. Select a program to open its details in an accessible dialog. Program details are presented in the dialog rather than separate public detail routes.
- **About:** read about the unit's mandate, staff, and contact details.
- **Admin workspace:** authorized staff manage programs, degree programs, application cycles, announcements, and the audit trail. The workspace supports previews, publishing, unpublishing, archiving, and restoring records.

Publishing a program does **not** mean applications are open. An application action appears only when SFAU has verified the official HTTPS link and application window and the cycle is eligible to open. Missing, invalid, unverified, or held cycles do not expose an application action.

## Technology

- Next.js App Router, React, and TypeScript
- Tailwind CSS, HeroUI, and Poppins typography
- Neon Postgres for content and Neon Auth for staff sign-in

Public content is read on the server. Admin operations require a Neon Auth session and an authorized entry in `admin_profiles`. The database connection is kept on the server.

## Local development

Use Node.js 22 or newer and npm. Node.js 22 is needed for the test command's TypeScript stripping option. A Neon Postgres database and Neon Auth are needed for database-backed content and the admin workspace.

```powershell
npm ci
Copy-Item .env.example .env.local
```

Fill in `.env.local` with the values for your Neon project, then start the development server:

```powershell
npm run dev
```

Open <http://localhost:3000>. Without a configured or reachable database, database-backed sections display an error state instead of published content. Static service information remains available.

### Environment variables

| Variable                        | Purpose                                                                                             |
| ------------------------------- | --------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                  | Pooled Neon connection used by the application.                                                     |
| `DATABASE_URL_UNPOOLED`         | Direct connection for migrations and imports.                                                       |
| `NEON_AUTH_BASE_URL`            | Neon Auth service URL.                                                                              |
| `NEON_AUTH_COOKIE_SECRET`       | Server-side secret used for auth cookies.                                                           |
| `SFAU_TRUSTED_EXTERNAL_ORIGINS` | Optional comma-separated list of approved HTTPS origins for application, image, and document links. |

Use `.env.example` as the template. Keep real connection strings and secrets in local or hosting environment settings; do not commit them.

### Database setup

For a new database, apply the SQL files in order using a direct connection. The seed file is under `supabase/` for historical reasons and inserts only the service and scholarship categories. Set `DATABASE_URL_UNPOOLED` in your shell first; values in `.env.local` are not automatically loaded by `psql`.

```powershell
psql $env:DATABASE_URL_UNPOOLED -v ON_ERROR_STOP=1 -f neon/migrations/0001_sfau.sql
psql $env:DATABASE_URL_UNPOOLED -v ON_ERROR_STOP=1 -f supabase/seed.sql
psql $env:DATABASE_URL_UNPOOLED -v ON_ERROR_STOP=1 -f neon/migrations/0002_assign_service_categories.sql
```

The first migration creates the schema and is not intended to be rerun on an existing database. Apply only migrations that have not already been applied. The second migration assigns service categories to existing imported records; run it after the categories exist. Review migrations and use a disposable branch when testing changes.

## Staff access and content workflow

1. Create or invite a staff user in Neon Auth, or use `/admin/setup` when setting up a sign-in. A sign-in account alone does not grant CMS access.
2. Have a database administrator add the Neon Auth user ID, display name, and `administrator` or `editor` role to `admin_profiles`. Sign in at `/admin/login`.
3. In **Programs**, create a draft with a stable lowercase slug, service and scholarship categories, and the applicable details and degree programs. Review the content before publishing.
4. In **Application cycles**, enter the dates, link type, and official HTTPS application URL. Confirm verification only after SFAU checks the destination and window. Editing a cycle requires fresh confirmation; saving without it returns the cycle to unverified. Use the hold or close override when applications must stop.
5. Manage published records with **Unpublish**, **Archive**, and **Restore**. Restore returns a record to draft. Normal workflows archive records; database triggers block hard deletion of programs, cycles, and announcements.
6. Create announcements as drafts and publish them after review. Scheduled publishing is not enabled; the database field is reserved for a future scheduler.
7. Review the **Audit trail** after material changes. It records the actor, action, time, and relevant before and after data.

The CMS validates slugs, application dates, HTTPS URLs, optional trusted origins, and content at the server boundary. Scholarship records should be reviewed by SFAU before publication.

## Import scholarship source data

The CSV importer defaults to a dry run. It checks the expected source columns, flags records for review, preserves source information, and creates no application cycles. Reports are written under the ignored `reports/` directory by default, so generated files are not committed.

```powershell
node scripts/import-scholarships.mjs --input "path/to/scholarships.csv" --report reports/scholarship-import-report.json
```

After reviewing the report and approving the import, run:

```powershell
node scripts/import-scholarships.mjs --input "path/to/scholarships.csv" --report reports/scholarship-import-report.json --apply
```

`--apply` needs `DATABASE_URL_UNPOOLED` or `DATABASE_URL` in a trusted CLI environment. It creates draft programs and source records; SFAU must review and publish the content and separately verify application cycles.

## Images and project structure

- `public/upvhero.jpg` and `public/upv-logo.jpg`: shared hero and institutional mark.
- `public/services/`: images for the service cards and homepage carousel. Replace an image using its existing filename, or update the image mappings in `src/components/service-carousel.tsx` and `src/app/(public)/services/page.tsx`.
- `public/about/team/`: staff photographs shown on the About page.
- `src/app/`: public pages, admin routes, API routes, and global styles.
- `src/components/`: shared UI, directories, carousel, and admin forms.
- `src/lib/`: content queries, authentication, validation, and admin actions.
- `neon/migrations/`: current Neon schema and data migrations. `supabase/migrations/` contains the earlier Supabase implementation.
- `scripts/`: the scholarship CSV importer and its tests.

Check that institutional marks and staff photographs are approved for their intended use before replacing or reusing them.

## Commands

```powershell
npm run dev        # Start the development server
npm run build      # Build for production
npm run start      # Start a production build
npm run lint       # Run ESLint
npm run typecheck  # Check TypeScript
npm run test       # Run the Node.js tests
```

The historical architecture decision record is in [docs/ADR-0001-foundation.md](docs/ADR-0001-foundation.md); its database and authentication choices have been superseded by the current Neon implementation.
