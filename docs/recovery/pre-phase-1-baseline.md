# Pre-Phase 1 production baseline

Captured: 2026-08-02, before stabilization changes.

## Safety position

The repository is on `recovery/secure-global-theme` and contains substantial active recovery work. No reset, stash, clean, checkout, branch switch, migration rewrite, or automatic commit is authorized. Uncertain files remain preserved and require owner review.

## Git baseline

- Branch: `recovery/secure-global-theme`
- Tracked deletion: `wrangler.toml`
- Tracked modifications: `.gitignore`, the root `index.html`, `src/worker.js`, `scripts/validate-portal-links.mjs`, the primary portal/auth/admin HTML files, the legacy page set, and navigation/auth/admin JavaScript and CSS.
- Untracked production/recovery areas: `package.json`, `package-lock.json`, `wrangler.jsonc`, `wrangler.rc1.jsonc`, `src/preview-worker.js`, migrations `0001` through `0010` except the already tracked `0005` and `0006`, current structured data, methodology/lifecycle/assessment/transformation routes, current shared CSS/JavaScript, validation/build scripts, and recovery/implementation documentation.
- Untracked non-source or uncertain areas: `greenfield-portal - backup/`, `greenfield-portal/work/`, `greenfield-portal/index_files/`, `tmp/`, logs, PID files, `.bak` files, temporary HTML, Office lock files, downloaded/generated workbooks, screenshots, and local Wrangler state.

The complete machine-readable file state remains available through `git status --short` at this commit boundary. Because the tree was already dirty, ownership cannot be inferred from tracked status alone.

## Production and preview configuration

- Production configuration: `wrangler.jsonc`
- Worker: `src/worker.js`
- Production asset root: `greenfield-portal/`
- Bindings: D1 `DB`, R2 `RESOURCE_FILES`, static `ASSETS`
- Worker-first paths: `/api/*`, `/downloads/*`, `/admin*`, `/login*`, `/register*`, `/pages/*`, `/`
- Preview configuration: `wrangler.rc1.jsonc`
- Preview Worker: `src/preview-worker.js`
- Preview asset root: `greenfield-portal/`
- Preview behaviour: static assets with no-cache response headers; no production D1/R2 application behaviour

Before stabilization, Wrangler 4.114.0 scanned 16,259 files from the asset root. The production dry-run succeeded with a 95.22 KiB Worker upload (22.98 KiB gzip).

## Migrations

Existing migrations, in lexical application order, are:

1. `migrations/0001_portal.sql`
2. `migrations/0002_content_management.sql`
3. `migrations/0002_google_auth.sql`
4. `migrations/0003_resources.sql`
5. `migrations/0004_menu_taxonomy.sql`
6. `migrations/0005_page_access.sql`
7. `migrations/0006_glossary.sql`
8. `migrations/0007_knowledge_platform.sql`
9. `migrations/0008_admin_feature_parity.sql`
10. `migrations/0009_account_recovery.sql`
11. `migrations/0010_theme_management.sql`

No migration may be edited during stabilization. The duplicate `0002` prefix is historical and should be retained; a future migration must use the next unused number.

## Package scripts before stabilization

The package provides static and Wrangler development, dry-run deployment, type generation, local/static validation, shell validation, link auditing, lifecycle validation, encoding validation, and production/RC1 deployment commands. It does not yet provide an explicit local migration command or a named full Worker runtime command.

## Baseline validators and runtime

- `npm run check`: pass; 16,259 assets scanned.
- `npm run dev:local`: pass; `/` returned HTTP 200.
- JavaScript syntax: pass; 50 files, zero failures.
- Encoding: pass; zero rendered-source mojibake failures.
- Portal links: fail; three Stage 0 Mobilise links incorrectly target `/transformation/stage-1-mobilise/`.
- Internal link audit: fail; three missing Mobilise routes and eight missing standards anchors.
- Methodology: fail; current navigation contract differs from the validator and Lifecycle does not match its expected dedicated target.
- Assessment platform: pass.
- Assess Readiness: pass.
- Lifecycle drafts: pass; 14 routes and zero errors.
- Shared shell: pass.
- Rendered homepage: HTTP 200, no console warnings/errors, semantic header/nav/main/footer, skip link, functional collapsed mobile navigation, and no horizontal overflow at 390, 768, or 1440 pixels.

## File classification

### Active production files

- `wrangler.jsonc`, `src/worker.js`, `package.json`, `package-lock.json`
- `greenfield-portal/index.html`, `admin.html`, `login.html`, `register.html`
- `greenfield-portal/pages/*.html` except `solutions_test.html` and `*.bak`
- `greenfield-portal/transformation/`, `lifecycle/`, `journey/`, `assessments/`, `standards/`, `deliverables/`, and `tools/`
- `greenfield-portal/assets/css/`, `assets/js/`, `assets/data/`, and referenced images
- Required `greenfield-portal/downloads/`
- `migrations/*.sql`
- Validators and build scripts referenced by `package.json`

### Active recovery work

- Modified tracked portal pages and shared navigation/theme/auth/admin files
- New methodology, transformation, lifecycle, assessment, discovery, readiness, knowledge, and shared-shell files
- `wrangler.jsonc`, `wrangler.rc1.jsonc`, `src/preview-worker.js`, and migration additions
- `docs/recovery-*`, `docs/ux-1/`, `docs/FP-1-*`, and enterprise transformation implementation records

### Generated artifacts and deployment packages

- `greenfield-portal/work/` including `deploy-package-*`, generated document/spreadsheet sources, inspections, and screenshots
- `tmp/` reports and screenshots
- `greenfield-portal/index_files/` captured-site assets

These are preserved, but they are not production routes and should not be uploaded as public static assets.

### Local runtime artifacts

- `.wrangler/`
- `*.log`
- `*.pid`, including `greenfield-portal/.local-server-8081.pid`
- local D1/R2 state

### Backups

- `greenfield-portal - backup/`
- `greenfield-portal/index.html.bak`
- `greenfield-portal/pages/ai-automation-spectrum.html.bak`

### Test and temporary files

- `greenfield-portal/pages/solutions_test.html`
- `greenfield-portal/temp_body.html`
- `greenfield-portal/withHero.html`
- `greenfield-portal/withStyle.html`
- Office lock files beginning `~$`

### Historical documentation

- Existing phase, recovery, feature-parity, UX, blueprint, and decision records under `docs/`
- Portal-local audit/change records under `greenfield-portal/docs/`

### Unknown and requiring owner review

- `greenfield-portal/AI_Governance_Qualification_Framework.xlsx`
- Root legacy HTML/content directories outside `greenfield-portal/`
- `greenfield-portal/public/` versus root `public/`
- Download copies that may duplicate R2-managed resources
- Empty `greenfield-portal/transformation-lifecycle/`
- Any work artifact intended as a future downloadable production deliverable

Unknown items are neither deleted nor excluded unless they match an independently safe runtime-artifact pattern.

## Reference evidence for deployment exclusions

Repository searches found no production runtime, HTML, CSS, JavaScript, Worker, or package-script dependency on `work/`, `index_files/`, backup HTML, `solutions_test.html`, temporary HTML, or the local PID file. Existing validators already omit the same backup/work/captured-site candidates. Cloudflare's current static-assets guidance specifies `.assetsignore` at the root of the configured assets directory, using `.gitignore` syntax.

## Recommended commit grouping (do not commit automatically)

1. **Worker and deployment configuration:** `package.json`, `package-lock.json`, `wrangler.jsonc`, `wrangler.rc1.jsonc`, `src/worker.js`, `src/preview-worker.js`, `greenfield-portal/.assetsignore`.
2. **D1 schema additions:** all `migrations/*.sql`, kept byte-for-byte as currently recovered.
3. **Shared navigation and theme recovery:** `greenfield-portal/assets/css/navigation.css`, `admin.css`, `shared-site-shell.css`, `ux1-visual-system.css`, `methodology.css`, `methodology-v10.css`, `home-platform.css`, `home-platform-v10.css`, `platform-sections.css`; `greenfield-portal/assets/js/navigation.js`, `shared-site-shell.js`, `ux1-visual-system.js`, `methodology.js`, `methodology-v10.js`, `home-platform.js`, `platform-sections.js`, `admin.js`, and `auth.js`; modified shell/auth/admin HTML files.
4. **Transformation, lifecycle, assessment, and knowledge content:** `greenfield-portal/assets/data/*.json`; `greenfield-portal/transformation/**`; `greenfield-portal/lifecycle/**`; `greenfield-portal/journey/**`; `greenfield-portal/assessments/**`; `greenfield-portal/standards/**`; `greenfield-portal/deliverables/**`; `greenfield-portal/tools/**`; new production pages and their page-specific scripts.
5. **Validation and audit tooling:** `scripts/*.mjs` and `scripts/*.cjs` that are referenced by package scripts or documented build processes.
6. **Documentation:** `docs/**` and reviewed `greenfield-portal/docs/**`.
7. **Local/generated exclusions:** `.gitignore` only. Preserve but do not commit ignored runtime artifacts, backups, captured-site files, `work/`, deploy packages, and `tmp/` outputs until owner review.

Each group must be reviewed against `git diff` and an explicit untracked-file manifest before staging. Authentication, access control, R2 download behaviour, and existing migrations must receive separate owner review rather than being incidentally bundled with presentation work.
