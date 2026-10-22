# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Primary: UP Visayas students looking for scholarships, financial assistance, and related student support services.
- Secondary: authorized OSA-SFAU staff who maintain program information, announcements, and application cycles in the admin workspace.

## Product Purpose

The OSA-SFAU website helps students find official information about available support and understand the appropriate next step. It gives staff a controlled way to publish and maintain that information.

## Positioning

Application availability is shown only after SFAU verifies the application window and official destination. Publishing program information alone does not mean applications are open.

## Operating Context

- Students browse services, search published programs, review program details and requirements, and follow verified official application links when available.
- Staff draft and publish programs and announcements, manage application cycles, and review an audit trail.
- The site is the public information surface for the Scholarships and Financial Assistance Unit of the University of the Philippines Visayas Office of Student Affairs.

## Capabilities and Constraints

- The public site includes a services hub, scholarship directory, search, program details, announcements, and unit information.
- The admin workspace uses Neon Auth and Neon Postgres. Only authorized administrator or editor accounts can change content.
- Program publication and application availability are separate states. An application action requires a verified link and window; unverified, invalid, missing, or held cycles must not expose an application action.
- Public scholarship records must come from verified SFAU content. Source imports begin as drafts and do not create application cycles.
- Current public content may be empty while SFAU reviews and publishes records. The site must distinguish empty content from loading or data errors.

## Brand Commitments

- Use the institution and unit names accurately: University of the Philippines Visayas and Office of Student Affairs - Scholarships and Financial Assistance Unit (OSA-SFAU).
- Treat existing institutional marks and staff imagery in the repository as source assets whose provenance and current approval should be checked before reuse in new contexts.

## Evidence on Hand

- The repository contains public service descriptions, unit information, institutional image assets, and an admin workflow (`src/types/domain.ts`, `src/lib/constants.ts`, `public/`, `README.md`).
- The database migration and admin workflow support controlled publication and application verification (`neon/migrations/0001_sfau.sql`, `README.md`).
- Scholarship records are not seeded as verified content. The README states that CSV and PDF values require SFAU review before publication.

## Product Principles

1. Make official support information easy for students to find and understand.
2. Treat application availability as verified information, never an inference from a listing or source file.
3. Separate staff editing and publishing from the public student's view.
4. Show uncertainty and unavailable data plainly instead of implying that applications are open.
