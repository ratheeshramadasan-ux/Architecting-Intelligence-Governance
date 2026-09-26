# Portal completion — staging acceptance report

Date: 2026-09-24  
Environment: staging only  
Worker: `architecting-ai-staging`  
Worker version: `112ffc76-d85d-402d-8870-56d924d589b2`

## Isolation and backup

- D1: `architecting-ai-portal-staging` (`681efd66-d141-4ee0-a3c0-d991c1b8a0fa`)
- R2: `architecting-ai-resources-staging`
- Default `workers.dev` address only; no custom route or production binding.
- Pre-migration D1 export: `.staging-backups/2026-09-24-portal-completion/before-0016.sql`
- Production D1, R2, routes, secrets and Worker were not modified.

## Implemented and verified

- Additive migration `0016_people_showcase_media.sql` applied successfully.
- Four supplied case-study exploded-view PNG originals uploaded to deterministic staging R2 keys and linked through D1-managed `library_assets` and `showcase_media` records.
- Public case-study order is 01 Dental Claims, 02 User Onboarding, 03 Banking Customer Support, 04 Agentic Commission Operations.
- Staging API returns four published case studies, three published demos, one exploded-view asset per case study, and no duplicates.
- Every exploded-view route returned HTTP 200 with `image/png`.
- Admin supports upload/replace/remove, alt text and caption for the case-study exploded view.
- Central `people_profiles` model and Admin editor added. Ratheesh Ramadasan and Ranjith Pilanku are seeded without inventing missing profile information.
- Homepage and About page consume the public People API. A neutral placeholder is used for Ranjith until an approved portrait is uploaded.
- Public API returned both profiles.
- Case-study collection and homepage evidence use canonical numeric case-study ordering.
- Interior staging shell was visually checked in the in-app browser; homepage dark visual treatment and responsive single-column layout were also checked.

## Validation results

- Worker and browser JavaScript syntax: PASS.
- Phase 1 integration suite: 5/5 PASS.
- Phase 2 integration suite: 6/6 PASS.
- Local migration 0016: PASS (13 SQL commands).
- `npm run validate:local`: PASS.
- 199 production HTML pages: no broken local targets, duplicate IDs, missing H1 headings or missing image alt attributes.
- Internal link audit: 205 pages, 622 links, 0 broken, 0 missing anchors, 0 incorrect stage destinations, 0 redirects.
- Staging Wrangler dry run: PASS with staging-only D1/R2 bindings.
- Staging migration and deployment: PASS.

## Known limitations

- Authenticated Admin visual inspection requires the administrator to sign in; the automated RBAC/API suites passed, but no administrator password was used or exposed during this run.
- Watermark fields continue to state policy/request status only. No claim of PDF watermark processing is made.
- Ranjith Pilanku uses an approved neutral placeholder because no portrait or LinkedIn URL was supplied.

## Rollback

Application rollback:

1. `npx wrangler rollback 24b03fbc-5179-4957-8a2b-6503c77df0ed --env staging`
2. Verify `/api/showcase`, `/api/navigation`, `/login` and `/admin` on the staging workers.dev address.

Data rollback (only if specifically required):

1. Preserve a new post-change export first.
2. Restore the pre-change staging export from `.staging-backups/2026-09-24-portal-completion/before-0016.sql` into a newly created staging D1 database.
3. Change only the `env.staging` D1 binding to that restored staging database and redeploy with `--env staging`.
4. Do not attempt to reverse an additive D1 migration in place.

R2 rollback is normally unnecessary because the four new objects are additive and older Worker versions ignore them. If removal is explicitly approved, delete only the four exact `showcase/case-study-0X/...png` staging keys after the database is rolled back.

## Production prerequisites

- Explicit production approval.
- Fresh production D1 export and confirmed production R2 backup policy.
- Resolve migration 0016 against a production clone and verify Case Study 04 slug/asset reconciliation.
- Upload the same four originals to production R2 using the deterministic keys.
- Apply migration 0016, deploy a pinned Worker version, run smoke tests, then monitor logs.
- Keep the prior production Worker version and pre-migration D1 export available for rollback.
