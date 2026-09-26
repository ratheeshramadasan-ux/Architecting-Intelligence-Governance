# Admin CMS Phase 1 baseline

Captured: 2026-09-23 (America/Edmonton), before Phase 1 implementation.

## Repository and validation baseline

- Branch: `codex/portal-stabilization`.
- The working tree already contained unrelated user changes; Phase 1 must preserve them.
- `npm run validate:local`: PASS.
  - JavaScript syntax: 52 files checked, 0 failures.
  - Encoding: 0 issues.
  - Portal pages: 199 production HTML pages.
  - Link audit: 205 pages and 612 internal links, with no broken, missing, or wrong destinations.
  - Methodology, lifecycle, assessment/readiness, and shared-shell validations passed.
- `npm run validate:worker`: could not run against an application because no local Worker was listening. Every request failed at connection time; this is an environment baseline, not a verified application defect.

## Data and access baseline

- Local D1 contains 35 rows in `menu_items`: 10 roots and 25 children.
- Local D1 contains 27 rows in `page_access`.
- The public navigation in `assets/data/methodology.json` contains 9 roots and 60 children (69 entries total).
- `/api/navigation` reads the legacy `menu_items` table, but existing public header renderers read `assets/data/methodology.json`. Admin changes therefore do not reliably affect the public header.
- The existing Admin menu save replaces all legacy menu rows by deleting them before inserting the replacement. A failed insert can leave no complete active menu.
- Admin authorization currently depends primarily on `users.role = 'admin'`; the existing access-role and permission tables are not consistently enforced at API boundaries.
- Managed HTML is filtered by regular-expression replacement and does not provide parser-based allow-list sanitization.

## Public route and navigation baseline

- Public navigation roots: Home; Get Started; Build AI Solutions; Rules & Standards; Learn; Case Studies & Demos; Templates & Reports; Tools; About.
- Public-route behavior is governed by `page_access` when a matching row exists and otherwise by `portal_config.public_paths`. Anonymous users can access explicitly public paths; protected HTML is returned through the portal's gated-preview response.
- Public JSON endpoints such as `/api/navigation`, `/api/resources`, and `/api/case-studies` are anonymous by design, with record-level visibility filtering where implemented.
- `/api/admin/*` endpoints require an authenticated Admin under the pre-change implementation.

This file is the immutable comparison point for Phase 1. It intentionally contains no credentials, session tokens, object keys, or production-only values.
