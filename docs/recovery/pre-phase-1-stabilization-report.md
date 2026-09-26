# Pre-Phase 1 stabilization report

Date: 2026-08-02

## A. Stabilization summary

The production baseline is now documented and reproducible without beginning Phase 1. Changes were limited to:

- baseline, local-runtime, validator-alignment, and architecture-decision documentation;
- safe Git/deployment ignore rules;
- correction of three Stage 0 Mobilise links;
- resolution of eight invalid standards deep links using existing factual content or the closest valid existing section;
- alignment of the methodology validator with the accepted production IA and `/lifecycle/` contract;
- explicit local Worker/D1 commands and a read-only local Worker contract validator;
- exclusion of `_test` and `.bak` pages from the live production-page validator.

No authentication, session, Google OAuth, access-control, admin workflow, R2 implementation, Worker business logic, migration, homepage design, navigation renderer, lifecycle structure, search, or standards catalogue was changed.

## B. Git state

- Current development repository: `C:\Users\rathe\Documents\Projects\Architecting-AI-Portal-Development`.
- Active branch: `codex/portal-stabilization`.
- No branch switch, reset, clean, stash, staging, or commit occurred.
- The pre-existing tracked deletion of `wrangler.toml` remains unresolved.
- Pre-existing modified production/recovery files and the large untracked recovery set remain intact.
- Safe ignore patterns now hide local logs/PIDs, office locks, temporary audit output, the preserved backup directory, captured-site files, generated deployment packages, known backup/temporary HTML, and the explicit test page.

Recommended commit groups and exact scope are recorded in `docs/recovery/pre-phase-1-baseline.md`. Authentication/access-control/R2 and migrations require owner review before inclusion in any commit.

## C. Deployment assets

- Wrangler version: 4.114.0.
- Configured asset root: `greenfield-portal/`.
- Wrangler reports 16,259 raw directory entries before and after stabilization. This message is emitted before `.assetsignore` matching and therefore is not the upload-manifest count.
- Files on disk under the asset root: 483.
- Post-ignore deployable files: 351.
- Excluded files: 132, approximately 17.3 MB.
- Wrangler debug output confirmed exclusion of `work/`, deploy packages, `index_files/`, backup HTML, temporary HTML, the test page, and the local PID file.

The tracked `.assetsignore` already controlled the largest pollution sources. Stabilization documented and retained those rules while making runtime/log/office-lock handling explicit. Nothing was deleted or moved.

Still requiring owner review: the root workbook copy, duplicate download candidates, root legacy sites, portal-local `public/`, empty `transformation-lifecycle/`, and generated work products that might later become intentional deliverables.

## D. Broken-link repair

Corrected in `transformation/stage-0-mobilise/index.html`:

- executive dashboard → `/transformation/stage-0-mobilise/dashboards/executive/`
- programme manager dashboard → `/transformation/stage-0-mobilise/dashboards/programme-manager/`
- Mobilise search → `/transformation/stage-0-mobilise/search/`

Standards links now resolve as follows:

- ISO/IEC 42001 → existing framework article at `governance-integration.html#iso42001`
- ISO 31000 card → existing operational-risk decision section; no unsupported ISO-specific mapping added
- ISO/IEC 27001 → existing cybersecurity/framework article at `#iso27001`
- NIST AI RMF → existing framework article at `#nist-rmf`
- IEEE 7000 card → existing control-framework section; link label changed to avoid claiming an unsupported IEEE mapping
- EU AI Act → existing framework article at `#eu-ai-act`
- UK GDPR card → existing data-protection decision section; no unsupported legal mapping added
- integrated crosswalk → existing integrated control-spine section at `#crosswalk`

Result: 589 internal links, zero broken routes, zero missing anchors, zero wrong-stage destinations, and no duplicate IDs.

External-bookmark redirects from the erroneous `stage-1-mobilise` paths were not added. They should be considered separately only if access logs or published references show those invalid paths were externally distributed.

## E. Local Worker runtime

Full instructions are in `docs/development/local-worker-runtime.md`.

```powershell
npm ci
npm run db:local:migrate
npm run dev:worker
```

In another terminal:

```powershell
npm run validate:worker
node scripts/validate-live.mjs http://127.0.0.1:8787
```

Local D1 and R2 are used. Production secrets and personal data are neither required nor copied.

## F. Navigation decision

`docs/architecture/adr-navigation-source-of-truth.md` recommends a version-controlled canonical schema/fallback plus a D1-published version using the same schema, one normalizer, and one renderer. It explicitly reconciles `methodology.json`, `menu_items`, `/api/navigation`, both renderers, and `STATIC_CONTENT_PAGES`. No consolidation was implemented.

## G. Theme decision

`docs/architecture/adr-theme-source-of-truth.md` recommends one approved token schema, version-controlled fallback, validated D1-published overrides where administration is required, one CSS-variable output, shared shell ownership, and an explicit legacy compatibility layer. No CSS consolidation was implemented.

## H. Validation results

| Command/check | Result |
|---|---|
| `npm run db:local:migrate` | Pass; local database already fully migrated |
| `npm run validate:local` | Pass |
| JavaScript syntax | Pass; 51 files, zero failures |
| Encoding | Pass; zero rendered-source mojibake failures |
| Portal links | Pass; 199 production pages |
| Internal link audit | Pass; 201 pages, 589 links, zero errors |
| Methodology | Pass; accepted navigation and 14 transformation stages |
| Assessment platform | Pass; 24 assessments |
| Assess Readiness | Pass; 10 workspaces and 17 deliverables |
| Lifecycle drafts | Pass; 14 routes, zero errors |
| Shared shell | Pass |
| `npm run check` | Pass; production Worker dry-run |
| `npm run check:rc1` | Pass; preview Worker dry-run |
| `npm run dev:local` homepage | Pass; HTTP 200, 4,779 bytes |
| `npm run dev:worker` | Pass on port 8799 with local D1/R2/assets |
| `validate-worker-local.mjs` | Pass; 8 Worker/API/access/R2 contracts |
| `validate-live.mjs` against Worker | Pass; 26 production legacy pages |
| Browser console | Pass; zero warnings/errors |
| Responsive structure | Pass at 390×844, 768×1024, 1440×900; no horizontal overflow, required landmarks and skip link present |

One initial Worker launch used port 8796, which was already occupied by an older local process and failed to start. A free port (8799) was used successfully. The unrelated pre-existing listener was not stopped or modified.

Wrangler reported that 4.118.0 is available; the project remains on its installed 4.114.0 dependency because dependency upgrades are outside this stabilization scope.

## I. Smallest safe Phase 1 proposal

| File | Classification | Phase 1 purpose |
|---|---|---|
| `greenfield-portal/assets/data/methodology.json` | Modify | Separate canonical navigation metadata from transformation content without duplicating either |
| `greenfield-portal/assets/js/methodology-v10.js` | Modify | Call the future shared normalizer/renderer |
| `greenfield-portal/assets/js/navigation.js` | Compatibility-only | Bootstrap the shared renderer for legacy pages; retain legacy interactions |
| `greenfield-portal/assets/js/shared-site-shell.js` | Modify | Own one shell initialization path |
| `greenfield-portal/assets/css/shared-site-shell.css` | Modify | Own shell, focus, viewport, header/footer frame rules |
| `greenfield-portal/assets/css/methodology-v10.css` | Compatibility-only | Consume shared tokens while preserving methodology components |
| `greenfield-portal/assets/css/navigation.css` | Compatibility-only | Preserve legacy page content/navigation behavior during migration |
| `greenfield-portal/assets/data/navigation.json` | Add | Version-controlled canonical navigation schema and fallback |
| `greenfield-portal/assets/js/navigation-model.js` | Add | Validate/normalize static and API navigation into one shape |
| `greenfield-portal/assets/js/navigation-renderer.js` | Add | One accessible desktop/mobile renderer |
| `greenfield-portal/assets/data/design-tokens.json` | Add | Approved version-controlled theme fallback |
| `src/worker.js` | Preserve initially | API changes only after schema and fallback are proven |
| new additive D1 migration | Future migration | Versioned navigation document only after Phase 1 design approval |
| existing `migrations/*.sql` | Do not touch | Applied migration history |
| authentication, session, OAuth, R2, admin workflow code | Do not touch | Explicitly outside Phase 1 shared-foundation scope |
| homepage content/CSS/JS | Preserve | Homepage redesign begins only in Phase 2 |

## J. Rollback considerations

- `.gitignore` and `.assetsignore`: revert only the added patterns/comments; no files were moved or deleted.
- Mobilise links: restore the three original href values, though doing so intentionally reintroduces known 404s.
- Standards: remove the four added stable IDs and restore the eight original link targets/JSON relationships; no content was created or removed.
- Validator alignment: restore the historical menu array and `/journey/` expectation, though that would again conflict with the accepted current IA.
- Package scripts/local validator: remove the three script entries and `validate-worker-local.mjs`; production runtime is unaffected.
- Documentation/ADRs: remove the added documents; no runtime dependency exists.
- Local Wrangler state: stabilization applied no new migrations and imported no data. Local state can be handled separately with explicit approval.

Because the repository was dirty before stabilization, rollback should be performed by reviewing these exact file-level hunks, never by resetting the worktree.

## Remaining risks

- Recovery work is still largely uncommitted and untracked.
- The deleted `wrangler.toml` versus untracked `wrangler.jsonc` transition still requires owner-approved commit resolution.
- D1 navigation remains administrable but is not the public renderer's authority.
- Theme authority remains split pending Phase 1.
- Raw Wrangler traversal remains large because ignored directories are still physically nested under the asset root, although their files are excluded from deployment.
- Cross-browser Safari/Firefox execution was not available; responsive structure was checked in the connected Chromium-based browser.

Pre-Phase 1 stabilization stops here.
