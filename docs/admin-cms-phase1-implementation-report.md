# Admin CMS Phase 1 implementation report

Completed locally on 2026-09-23. No production D1, R2, secret, or Worker was modified.

## Delivered

- Added immutable `navigation_versions` publications. A replacement is inserted as a draft, validated, and activated with the previous published version in one D1 batch transaction. The legacy `menu_items` table is never deleted or rewritten.
- Migration 0014 records all 35 legacy D1 menu rows as a superseded import snapshot, then activates a separately reconciled 69-entry hierarchy matching the current public `methodology.json` navigation.
- `/api/navigation` now returns the published D1 version in one normalized contract. All three existing public header runtimes consume that API through `navigation-model.js` and fall back to the unchanged `methodology.json` navigation when the API is unavailable or invalid.
- Admin menu reads and writes now use the versioned publication model while retaining the flat shape required by the existing editor UI.
- Replaced regular-expression HTML filtering with parser-based, allow-list sanitization using `sanitize-html`.
- Enforced permissions from `access_roles` and `user_access_roles` at Admin API boundaries, including separate navigation, theme, library, settings, user, role, search, edit, review, approve, and publish capabilities.
- Preserved the configured `ADMIN_EMAILS`/`ADMIN_EMAIL` break-glass path. It requires an active authenticated user whose legacy role is `admin` and whose normalized email is explicitly configured.
- Existing active administrators are additively assigned the system Administrator access role by migration 0014.

## Changed files

- `docs/admin-cms-phase1-baseline.md` — pre-change route, navigation, data, access, and validation baseline.
- `docs/admin-cms-phase1-implementation-report.md` — this implementation/deployment record.
- `migrations/0014_versioned_navigation_rbac.sql` — additive navigation version schema, 35-row legacy snapshot, reconciled public seed, and Admin role preservation.
- `src/worker.js` — normalized navigation API, safe publication, RBAC authorization, workflow transition permissions, and parser-based sanitization.
- `greenfield-portal/assets/js/navigation-model.js` — sole public navigation API adapter and static fallback handler.
- `greenfield-portal/assets/js/methodology-v10.js` — API-backed header data.
- `greenfield-portal/assets/js/methodology.js` — API-backed compatibility header; removed its duplicate hard-coded submenu registry.
- `greenfield-portal/assets/js/navigation.js` — API-backed legacy header data.
- `scripts/test-admin-phase1.mjs` — isolated Worker/D1 integration suite.
- `package.json` and `package-lock.json` — runtime sanitizer dependency, ESM declaration, and Phase 1 test command.

## Verification results

- `npm run validate:local`: PASS (54 JavaScript files; 199 production HTML pages; 205 audited pages; 612 internal links; no syntax, encoding, route, anchor, or methodology validation failures).
- `npm run check`: PASS (Wrangler production-equivalent bundle dry run only; nothing deployed).
- `npm run test:phase1`: PASS in a temporary isolated D1 directory.
  - Navigation persistence.
  - Rejected publication leaves the active version unchanged.
  - Anonymous public navigation/home access and anonymous Admin denial.
  - Assigned editor permissions and configured break-glass administrator.
  - Editors cannot publish navigation or publish a page through the general save API.
  - Sanitization is enforced in Admin persistence and removes executable markup.
- `npm audit --omit=dev`: PASS, 0 production dependency vulnerabilities.

## Unresolved or intentionally deferred

- Production data, logs, bindings, and deployment behavior remain unverified because production access was intentionally not used.
- The current production site will continue its existing behavior until an explicitly approved migration and Worker deployment.
- `methodology.json` remains an intentionally static emergency fallback. Future Admin publications do not rewrite it; it should be refreshed only as part of a reviewed release when a new emergency baseline is desired.
- The allow-list sanitizer intentionally removes unsupported tags, event handlers, inline styles, and unsafe protocols. Existing managed content should receive a visual staging review before production deployment.
- The full development dependency audit reports four high-severity findings inherited through development tooling; the production dependency audit reports zero. Automated blanket upgrades were not applied in this scoped phase.

## Exact production deployment steps (only after explicit approval)

1. Check out the reviewed commit and run `npm ci`, `npm run validate:local`, `npm run test:phase1`, and `npm run check`.
2. Export a recovery snapshot: `npx wrangler d1 export architecting-ai-portal --remote --output phase1-predeploy.sql`.
3. Apply only the additive migration: `npx wrangler d1 migrations apply architecting-ai-portal --remote`.
4. Verify remotely, read-only, that `navigation_versions` has one `published` row, the legacy snapshot reports 35 records, the published validation reports 9 roots/69 entries, and `menu_items` still has 35 records.
5. Deploy the Worker/assets: `npx wrangler deploy`.
6. Smoke-test `/api/navigation`, the public home/header, one methodology header, one legacy header, anonymous Admin denial, an assigned non-admin role, and the configured break-glass account. Do not publish an Admin menu merely for smoke testing.

## Rollback

1. If the Worker is unhealthy, use `npx wrangler versions list` and `npx wrangler rollback <PREVIOUS_VERSION_ID>`.
2. Do not drop `navigation_versions` and do not delete any publication. The old Worker continues reading untouched `menu_items` (the original 35 rows).
3. If only navigation content is wrong while the new Worker is healthy, republish the prior known-good payload through the Admin menu endpoint. This creates another immutable version and atomically supersedes the bad one.
4. If D1 recovery is exceptionally required, first preserve a fresh export, then restore from `phase1-predeploy.sql` under a separately approved recovery procedure. The normal rollback does not require database restoration because migration 0014 is additive.
