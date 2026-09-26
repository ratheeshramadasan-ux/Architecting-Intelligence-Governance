# Phase 1 and Phase 2 staging acceptance report

Date: 2026-09-23 (America/Edmonton)

## Decision

Conditionally accepted in isolated staging. Core Phase 1 and Phase 2 API, persistence, publication, access-control, file, rendering, deployment and rollback behavior passed. A true device-width browser-emulation run remains outstanding because the available in-app browser controller did not expose viewport resizing.

No production D1 database, R2 bucket, secret, route, DNS record, custom domain or Worker deployment was read, exported, migrated or modified.

## Isolated resources

- Account: `8d109eb5fa5e16953d46d75308b661cd`
- D1: `architecting-ai-portal-staging`
- D1 ID: `681efd66-d141-4ee0-a3c0-d991c1b8a0fa`
- D1 region: `WNAM`
- R2: `architecting-ai-resources-staging`
- R2 region: `WNAM`
- R2 state after validation: one staging-only PDF object, 2.08 MB
- Worker: `architecting-ai-staging`
- URL: `https://architecting-ai-staging.ratheesh-ramadasan.workers.dev`
- Accepted/active Worker version after rollback exercise: `0b3a0f21-03e2-4232-9a5b-2ca5165901bf`
- Temporary second version used for rollback test: `3242b9da-0a87-44b4-9c97-55a5d147798c`

The resolved staging dry-run exposed only `architecting-ai-portal-staging`, `architecting-ai-resources-staging`, static assets, and staging variables. No routes or custom domains were configured.

## Configuration changes

`wrangler.jsonc` now contains an additive `env.staging` block. The top-level production configuration and `wrangler.rc1.jsonc` remain unchanged. Staging uses the same binding names expected by the Worker (`DB`, `RESOURCE_FILES`, `ASSETS`) but different resource identities.

## Migration and backup results

- The staging D1 database was newly created and contained no application tables or data, so there was no pre-existing staging data to preserve.
- All 16 repository migrations were applied in filename order, including both files with the `0002` prefix.
- `0014_versioned_navigation_rbac.sql`: applied successfully.
- `0015_showcase_content.sql`: applied successfully.
- Post-apply check: `No migrations to apply`.
- Post-migration backup: `.staging-backups/post-migration-2026-09-23.sql`.
- Migration seed state: two navigation versions, three published static case studies and three published demos.
- Case Study 04 was added through the Admin upload workflow using a local staging copy; no production record or object was copied.

## Acceptance matrix

| Area | Result | Evidence |
|---|---|---|
| Cloudflare authentication | PASS | `wrangler whoami`, D1 list and R2 list succeeded before provisioning. |
| Resource isolation | PASS | Unique D1 ID and staging-only R2 bucket; resolved dry-run showed no production binding. |
| Additive migrations | PASS | All migrations applied; subsequent migration list was empty. |
| Versioned navigation | PASS | Two versions present; normalized public API returned 200 after deploy and rollback. |
| Failed navigation publication rollback | PASS | Phase 1 isolated integration suite. |
| Static navigation fallback | PASS | Phase 1 suite and shared-shell static contract. `methodology.json` remains the fallback. |
| Header rendering | PASS | Desktop browser rendering showed the normalized header on the case-study collection. |
| Dropdown/mobile implementation contracts | PASS/PARTIAL | Shared-shell validation and responsive media/menu handlers passed; device-width interaction remains outstanding. |
| Existing static case studies | PASS | Dental Claims, User Onboarding and Banking Agentic AI rendered without duplication. |
| Case Study 04 | PASS | Uploaded, edited, ordered, featured, included in navigation, published, unpublished, archived and republished. Exactly one public record remained. |
| Existing demos | PASS | Customer Banking, AI Operations and Commission Operations rendered and opened successfully. |
| Demo Admin lifecycle | PASS | Temporary demo created, edited, ordered, added to submenu, published, unpublished and archived. |
| PDF metadata | PASS | R2 provider, object key, 2,080,050-byte size, PDF content type, upload time, review route and authorized download URL returned. |
| PDF preview/download | PASS | Authorized preview and public download returned HTTP 200 with `application/pdf`. |
| Watermark messaging | PASS | `watermark_requested=true`; `watermark_processing=not_implemented`. No enforcement claim is made. |
| Anonymous access | PASS | Public APIs/pages returned 200; Admin dashboard returned 403 and `/admin` redirected to login. |
| Signed-in non-admin access | PASS | Member session received 403 from Admin dashboard. |
| Break-glass administration | PASS | Configured staging administrator received 200 and completed all Admin workflows. |
| Sanitization | PASS | Legitimate section/heading/paragraph layout survived; script, event handler and `javascript:` URL were removed. |
| Worker rollback | PASS | Second staging version deployed, rolled back to version 1, then APIs and D1 content were reverified. |
| Content persistence through rollback | PASS | Four published case studies, three published demos, one archived test demo and two navigation versions remained. |
| Production and RC1 preservation | PASS | Production dry-run and RC1 dry-run both passed; no deployment was performed. |

## Automated test results

- `npm run test:phase1`: PASS, 5 scenarios.
- `npm run test:phase2`: PASS, 6 scenarios.
- `npm run validate:local`: PASS.
  - 55 JavaScript files: zero syntax failures.
  - Zero rendered-source encoding failures.
  - 199 HTML pages validated.
  - 205 pages and 612 internal links audited with zero broken links or anchors.
  - Shared-shell static contract: PASS.
- `npm run check`: PASS, production configuration dry-run only.
- `npm run check:rc1`: PASS, static RC1 dry-run only.
- `npx wrangler deploy --env staging --dry-run`: PASS with staging-only bindings.

## Browser evidence

Screenshots were captured in the validation session for:

1. Case Studies & Demos collection with the left rail fully visible.
2. Case Study 04 and the three original case studies in one collection.
3. Customer Banking Demo, including the “How to use this demo” control.
4. AI Operations Demo, including the operational dashboard and instruction control.
5. Commission Operations Demo, including the dashboard and instruction control.
6. Case Study 04 after correcting its staging cover URL and reloading the collection.

The in-app browser evidence is attached to the task transcript rather than stored as repository files.

## Staging-only test data

- Break-glass administrator account for the configured staging admin email.
- Non-admin member account used for RBAC denial testing.
- Case Study 04 and one R2 PDF object, left published for acceptance review.
- One temporary demo, left archived.
- One sanitizer validation page, left in draft state.

No production records, objects or secrets were copied.

## Unresolved items

1. Device-width browser emulation: the in-app browser controller ignored viewport dimensions and exposed no resize API. Responsive media rules at 980, 800, 760, 720, 680, 620, 560 and 430 pixels and mobile-menu behavior are present and static validation passed, but a Chrome DevTools or Playwright device matrix should be completed before production approval.
2. Google OAuth is not configured in staging (`/api/auth/providers` reported `google: false`). Password authentication, member authorization and break-glass administration were tested successfully.
3. Staging uses representative Case Study 04 metadata rather than production metadata. Production Case Study 04 must be reconciled in place by its existing library asset during the approved production migration.
4. Watermark request state is recorded, but PDF watermark processing is not implemented.
5. `npm run check` now reports Wrangler's safety warning when no environment is specified. Future operational commands should always use explicit `--env staging` or `--env=""`.

## Production prerequisites

Production remains unapproved. Before production deployment:

1. Complete the device-width browser matrix at 390x844, 768x1024, 1024x768 and 1440x900.
2. Review production Case Study 04 metadata and confirm its existing `library_assets` record/object key without copying or recreating it.
3. Export production D1 and record its file checksum and storage location.
4. Record the active production Worker version ID.
5. Confirm production R2 object count and Case Study 04 key using read-only inspection.
6. Run `wrangler deploy --dry-run --env=""` and verify only production bindings resolve.
7. Obtain explicit production approval.

## Proposed production deployment

Do not run these steps without explicit approval:

1. `npx wrangler d1 export architecting-ai-portal --remote --output <approved-backup-path>`
2. `npx wrangler versions list --name architecting-ai --json`
3. `npx wrangler d1 migrations list architecting-ai-portal --remote --env=""`
4. `npx wrangler d1 migrations apply architecting-ai-portal --remote --env=""`
5. Verify Case Study 04 reconciliation and duplicate counts with read-only SQL.
6. `npx wrangler deploy --env=""`
7. Run anonymous/member/admin, navigation, collection, PDF and legacy-route smoke tests.

## Rollback instructions

Worker rollback does not roll back D1 or R2:

1. `npx wrangler versions list --name architecting-ai --json`
2. `npx wrangler rollback <PREVIOUS_PRODUCTION_VERSION_ID> --name architecting-ai --yes --message "Rollback Phase 1/2 CMS deployment"`
3. Verify `/api/navigation`, `/api/case-studies`, `/api/showcase` and representative legacy routes.
4. Do not drop the navigation or showcase tables and do not delete library assets or R2 objects. Migrations 0014 and 0015 are additive and the prior Worker ignores them.
5. Unpublish or archive an affected showcase item if a content-only reversal is required.
6. Restore the D1 export only under a separately approved disaster-recovery procedure.

For staging, the tested rollback command was:

`npx wrangler rollback 0b3a0f21-03e2-4232-9a5b-2ca5165901bf --env staging --yes --message "Staging acceptance rollback exercise"`
