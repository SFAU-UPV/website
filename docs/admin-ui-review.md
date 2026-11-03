# Admin UI/UX review

Reviewed: 2026-11-04. Scope: workspace navigation, program editor, application cycles, announcements, sign-in/setup, shared admin styles, and route feedback.

The admin interface has a suitable task-based structure: separate publication and application verification, filtered program listings, reversible archive actions, confirmation dialogs, and explicit empty/error feedback. The review found functional issues that needed correction before cosmetic refinement.

## Findings addressed

| Priority | Finding | Change |
| --- | --- | --- |
| P1 | Clicking the active workspace section discarded an open editor without confirmation. | Clicking the active section now leaves the editor intact. |
| P1 | Editing a cycle could show empty dates when the database supplied Date objects. | Normalize date inputs and display cycle dates in Philippine time. |
| P1 | Mobile table headers used `display: none`, removing their labels from the accessibility tree. | Visually hide headers while retaining their content for assistive technology. |
| P2 | Reopening the same record after confirming discard could retain its unsaved form state. | Remount cycle and announcement forms when Edit is chosen. |
| P2 | Overview review shortcuts retained unrelated search/category filters and could hide the requested records. | Clear those filters when opening a review task. |
| P2 | Updated-date sorting compared strings, which is incorrect for Date object strings. | Compare timestamp values. |
| P2 | The application-cycle shortcut could leave a dirty program editor without confirmation. | Confirm before discarding changes; the editor's return link now targets Programs. |
| P2 | Announcement required fields and consequences of publishing were unclear. | Mark required fields and explain publication-date and student-alert behavior. |
| P2 | Editing an archived announcement offered visibility choices that bypassed Restore. | Preserve Archived in the editor; use the existing Restore action to restore it. |
| P2 | Small admin buttons, missing explicit textarea focus styling, and long unbroken announcement text reduced usability. | Set a 44px minimum height for workspace buttons, add textarea focus outlines, preserve line breaks, and wrap long text. |
| P2 | Workspace routes lacked dedicated pending and unexpected-error views. | Add loading feedback and an error boundary with retry and return actions. |

Dropdown triggers now include their field label in their accessible name. Cycle and announcement Cancel buttons are disabled while saving.

## Verification and limits

- Production build completed, including TypeScript and route generation.
- Targeted ESLint and whitespace checks passed, including after the final archived-option refinement.
- The Impeccable static detector reported no deterministic findings in the scanned console, login, and setup components. This is not a visual quality or accessibility certification.
- No authenticated browser session or browser automation package was available. Desktop/mobile screenshots, contrast measurements, keyboard walkthroughs, screen-reader behavior, and actual save/publish/archive round trips remain unverified.

## Follow-up assessment

Workspace section/filter state remains primarily local React state. Keeping it in the URL would improve reload and browser-history behavior. Announcement and cycle lists have no dedicated search or pagination, so their usability should be reassessed with actual staff data volumes. These are workflow improvements rather than confirmed task blockers.

Before declaring the interface fully validated, use an authorized test account to walk through editing, cancelling, saving, publishing, archiving, restoring, and connection failures at desktop and mobile widths. Check keyboard focus after dialogs close and after save feedback appears. Avoid using production publications for that walkthrough.
