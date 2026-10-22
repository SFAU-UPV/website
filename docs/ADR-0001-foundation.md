# ADR-0001: SFAU website foundation

Status: Superseded for database, authentication, and deployment tooling. The current implementation uses Neon Postgres and Managed Neon Auth; see `README.md` and `PRODUCT.md`. The domain and application-availability decisions below still apply.

## Decision

Use Next.js App Router with TypeScript and Tailwind CSS, backed by PostgreSQL through Supabase. Server Components remain the default for public content. Client Components are reserved for browser interaction such as filters and accessible form controls. Administrative authorization will be enforced server-side using Supabase Auth and database policies.

## Domain model

`programs` are reusable public records. `application_cycles` hold dated windows and verification state, so a program can recur without duplicate records. `scholarship_categories` and `program_category_links` support cross-listing. `service_categories` preserve the six-service taxonomy. `announcements` are independently publishable. `admin_profiles` and `audit_logs` establish the administrative boundary and change history.

Publication (`draft`, `published`, `archived`) is separate from application status (`unverified`, `upcoming`, `open`, `closed`, `suspended`). A public Apply action requires all of: published program, verified open cycle, valid date window, non-suspended state, and an HTTPS external URL.

## Boundaries and security

Students do not authenticate and no applicant profiles, response tracking, analytics, or Google Forms integrations are planned. Public queries must filter publication state on the server. Admin mutations will use authenticated server actions or route handlers, validate input at the boundary, and append audit records. Rich text will be sanitized or stored as structured content before rendering.

## Assets and deployment

Official UPV imagery and seals require authorization before being added. Until then, the UI uses typographic and geometric placeholders. Deployment assumes a Node-compatible Next.js host plus Supabase project variables; migrations are applied through Supabase CLI or the dashboard migration workflow.
