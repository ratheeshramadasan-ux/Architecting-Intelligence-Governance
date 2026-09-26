# Admin CMS Phase 2 implementation report

Completed locally on 2026-09-23. Production D1, R2, secrets, and deployed Workers were not accessed or modified.

## Implementation status

- D1 is authoritative for published case studies and demos through the additive `showcase_items` model.
- The three existing static case studies are imported with deterministic stable identifiers and their original anchors, cover images, PDF routes, and related links.
- The three existing demos are imported with deterministic stable identifiers and their original URLs.
- Existing uploaded Case Study records are reconciled by `asset_id`, title, and file name. Case Study 04 is assigned the stable slug `agentic-commission-operations`, linked to its existing `library_assets`/R2 record, and is not copied or re-uploaded.
- Admin supports case-study PDF upload plus metadata editing, featured state, ordering, stable slugs, cover image URLs, visibility, preview, publication, unpublication, archiving, and optional submenu inclusion.
- Admin supports demo creation, editing, preview, publication, unpublication, archiving, category, cover image, internal/HTTPS URL, ordering, visibility, featured state, and optional submenu inclusion.
- Public collection rendering uses `/api/showcase`. The original HTML cards and demo links remain in the page and are replaced only after a successful API response, providing a temporary static fallback.
- Phase 1 navigation publications remain immutable. The normalized navigation API derives optional case-study/demo children from published showcase records without rewriting the active base version.
- Admin file details report the actual provider, R2 object key or static path, R2 HEAD size/content type/upload time, review route, and authorized download URL.
- Watermark preference is retained as metadata. Admin explicitly reports `watermark_processing: not_implemented`, and downloads no longer claim that PDF watermarking was enforced.

## Changed-file inventory

- `migrations/0015_showcase_content.sql` — additive schema, deterministic static seeds, Case Study 04/library reconciliation, indexes, and permissions.
- `src/worker.js` — public collection APIs, Admin CRUD/workflow APIs, navigation derivation, R2 metadata, upload linking, access enforcement, and honest watermark behavior.
- `greenfield-portal/admin.html` — Case Study metadata controls, Demo module, and collection editor.
- `greenfield-portal/assets/js/admin.js` — Admin collection rendering and create/edit/preview/publish/unpublish/archive behavior.
- `greenfield-portal/assets/css/admin.css` — file-metadata layout and dialog controls.
- `greenfield-portal/case-studies/index.html` — API-managed collection targets while retaining static fallback markup.
- `greenfield-portal/assets/js/case-studies.js` — authoritative D1 collection rendering for case studies and demos.
- `scripts/test-admin-phase2.mjs` — isolated D1/R2 integration and reconciliation tests.
- `package.json` — `test:phase2` command.
- `docs/admin-cms-phase2-implementation-report.md` — this report.

## Migration reconciliation

- Fresh isolated migration: PASS; 3 published case studies and 3 published demos are seeded.
- Idempotent reconciliation simulation: PASS. A pre-existing published Case Study 04 library record and R2 object were inserted before re-running migration 0015. Exactly one linked showcase record was created with slug `agentic-commission-operations`; the original object key and download route were preserved.
- Duplicate prevention uses unique `stable_id`, unique `slug`, a unique partial index on `asset_id`, `INSERT OR IGNORE`, and title/file-name reconciliation against static seeds.
- Local development D1 migration 0015 applied successfully. Production migration was not run.

## Test results

- `npm run test:phase1`: PASS.
- `npm run test:phase2`: PASS.
  - Deterministic static import and Case Study 04 reconciliation.
  - Case-study upload, linked D1 record, R2 persistence, publication, ordering, navigation inclusion, and unpublication without PDF deletion.
  - Demo create, edit, Admin preview, publish, restricted visibility, unpublish/archive, and derived navigation removal.
  - Anonymous visibility filtering and editor publication denial.
  - Actual R2 object key, content type, size, upload timestamp, review route, and authorized download URL.
  - No false watermark-enforcement response header.
  - Legacy demo and static PDF URLs.
  - Phase 1 navigation publication version remains unchanged during showcase changes.
- `npm run validate:local`: PASS; 55 JavaScript files, 199 production HTML pages, 205 audited pages, and 612 links passed.
- `npm run check`: PASS; Wrangler dry run only, with no deployment.

## Unresolved or intentionally deferred

- Production Case Study 04 values remain unverified because production data was intentionally not queried or changed during implementation. The isolated test reproduces the expected published library/R2 record.
- Cover images are managed as safe internal or HTTPS URLs; a dedicated cover-image upload picker is not included in this phase.
- PDF watermark processing is not implemented. Only the requested policy flag is retained and accurately disclosed.
- External demo availability is not health-checked by the portal.
- Static cards remain as a temporary resilience fallback and should be retired only after an approved production observation period.
- Final responsive visual and accessibility acceptance should be performed in isolated staging with representative production metadata before production deployment.

## Isolated staging verification

1. Provision a staging Worker with separate D1 and R2 bindings; do not point staging at production resources.
2. Run `npm ci`, `npm run test:phase1`, `npm run test:phase2`, `npm run validate:local`, and `npm run check`.
3. Apply migrations to staging D1 and confirm six deterministic static records plus one linked Case Study 04 record if its library record is present.
4. Sign in as an assigned editor and verify editing works but publication is denied.
5. Sign in as an Administrator and upload a PDF, inspect its R2 metadata, preview it, publish it, include it in navigation, then unpublish and confirm the PDF record/object remain.
6. Create internal and HTTPS demos, verify preview/publish/archive, ordering, public visibility, and submenu behavior.
7. Test anonymous, authenticated, restricted, disabled-download, and archived states.
8. Verify the three legacy anchors, three demo URLs, and three static PDF URLs.
9. Inspect desktop and mobile headers and the collection layout before requesting production approval.

## Production plan — requires explicit approval

1. Export production D1 with `npx wrangler d1 export architecting-ai-portal --remote --output phase2-predeploy.sql` and record the current Worker version from `npx wrangler versions list`.
2. Run all local and isolated test commands from the reviewed commit.
3. Apply the additive migration with `npx wrangler d1 migrations apply architecting-ai-portal --remote`.
4. Read-only verify the static seed count, the unique linked Case Study 04 record, its unchanged `asset_id`, and the unchanged `library_assets.object_key`.
5. Deploy with `npx wrangler deploy`.
6. Perform the staging checklist as a production smoke test without creating duplicate records or re-uploading Case Study 04.

## Rollback

1. Roll back the Worker using `npx wrangler versions list` followed by `npx wrangler rollback <PREVIOUS_VERSION_ID>`.
2. Do not drop `showcase_items`, delete library records, or delete R2 objects. Migration 0015 is additive and the prior Worker ignores the new table.
3. The old static collection and legacy menu remain available after Worker rollback.
4. To correct Phase 2 content without a code rollback, unpublish or archive the affected showcase record. This retains its history, library record, and file.
5. Restore the D1 export only under a separately approved disaster-recovery procedure; normal rollback does not require database restoration.
