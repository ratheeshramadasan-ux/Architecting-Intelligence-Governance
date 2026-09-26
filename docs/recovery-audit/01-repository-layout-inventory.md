# Recovery Audit 01 — Repository and Layout Inventory

Date: 2026-07-28  
Branch: `codex/portal-content-theme-audit`  
HEAD: `409e754`

## Runtime and routing model

This repository is not a React, Vue, Next, or other component-framework application. It is a static multi-page HTML portal augmented by:

- a Cloudflare Worker entry point at `src/worker.js`;
- Cloudflare static assets rooted at `greenfield-portal` (`wrangler.jsonc:4-10`);
- D1-backed managed-page replacement, authentication, administration, access rules, search, and analytics;
- R2-backed downloads and media;
- client-side DOM injection from shared JavaScript files.

`package.json` contains only Wrangler lifecycle and validation scripts. There is no application bundler, JSX/TSX root, framework router, CSS-module loader, or component compiler.

## Root application entry and actual homepage

| Layer | Evidence | Behaviour |
|---|---|---|
| Cloudflare entry | `wrangler.jsonc:4` | Executes `src/worker.js`. |
| Static asset root | `wrangler.jsonc:6-10` | Serves `greenfield-portal`. |
| Worker-first routes | `wrangler.jsonc:10` | `/`, `/pages/*`, `/admin*`, auth, API, and downloads reach the Worker first. |
| Homepage decision | `src/worker.js:63-70` | Calls `serveManagedPage()` before `env.ASSETS.fetch()`. |
| Managed homepage lookup | `src/worker.js:694-713` | `/` maps to D1 `source_path='/index.html'`; a published record replaces the static `<main>`. |
| Static homepage fallback | `greenfield-portal/index.html:15-52` | Current static homepage, methodology shell placeholders, platform hero and content sections. |

Therefore, the homepage visible in a given environment can be:

1. the static `greenfield-portal/index.html`; or
2. that document with its `<main>` replaced from D1; or
3. a fully generated managed document when no source asset resolves (`src/worker.js:713,726-727`).

This data-dependent route is a direct reason local preview and deployed output can differ.

## Layout implementations

There are no framework “root layouts” or “nested layouts.” The effective layouts are HTML/JavaScript conventions.

| Path / implementation | Component or layout | Routes using it | Current / legacy | Header | Footer | Page navigation | Styles | Scrolling | Action |
|---|---|---|---|---|---|---|---|---|---|
| `greenfield-portal/index.html:15-52`; `assets/js/methodology-v10.js:32-46` | Methodology shell | Homepage | Current | Runtime `#methodology-header` | Runtime `#methodology-footer`, then overwritten by shared footer | Home explicitly excluded from generated submenu (`methodology-v10.js:193`) | `methodology-v10.css`, `home-platform-v10.css`, `ux1-visual-system.css`, late `shared-site-shell.css` | Intended centre-scroll, overridden to body scroll | Retain content; migrate shell to one root implementation |
| `greenfield-portal/transformation/**`, `assessments/**`, `deliverables/**`, `tools/**`, `journey/**` | Methodology route shell | 177 audited HTML documents contain `#methodology-header` and methodology JS | Current but generated/static hybrid | Runtime methodology header | Authored placeholder plus two runtime renderers | Generated `.page-submenu` except routes with `.stage-nav`; route-specific dashboard/detail navigation also exists | Primarily `methodology-v10.css`, sometimes platform CSS | Intended centre-scroll, overridden by late shared footer CSS | Retain content/data scripts; migrate outer shell |
| `greenfield-portal/transformation/stage-0-mobilise/index.html:21-42` | Stage 0 layout | Stage 0 only | Current variation | Methodology header | Methodology/shared footer | Authored vertical `.stage-nav` (`:22-26`) | `methodology-v10.css:45-46` | Main scroll plus sticky sidebar | Retain stage content; retire layout/navigation variation |
| `assets/js/methodology-v10.js:192-235`; `methodology-v10.css:86-109` | Generated reading layout | Most methodology/knowledge routes with headings | Current variation | Inherited | Inherited | `.page-submenu` inserted after hero; desktop is a 250px vertical column | `methodology-v10.css` | Sidebar competes with content inside main | Migrate to shared horizontal navigator |
| `greenfield-portal/pages/*.html`; `assets/js/navigation.js` | Legacy site shell | 11 navigation-script pages; legacy markup also remains on additional migrated pages | Mixed/legacy | Authored `.site-header`; navigation body filled at runtime | Authored footer or footer created at runtime | Runtime `.section-nav` on long legacy pages (`navigation.js:189-249`) | `legacy-visuals.css`, `navigation.css`, sometimes methodology and UX CSS | Intended centre-scroll; late shared footer CSS re-enables body scroll | Migrate content; retire shell markup |
| `src/worker.js:716-727` | Managed-page layout | Published D1 pages for `/` and `/pages/*` | Current dynamic bypass | Generated legacy header | No authored footer; added by `navigation.js` | Optional generated `.managed-left-nav` (`:722-723`) | `navigation.css` only, plus dynamically injected shared footer CSS | Same CSS conflict; vertical managed menu | Preserve renderer functionality; make it render shared shell contract |
| `greenfield-portal/admin.html:1-5` | Administration shell | `/admin` | Current functional exception | Admin-specific top bar | None | Admin module sidebar | `navigation.css`, `admin.css` | Admin workspace/document behaviour | Preserve functional shell; exclude from public page-topic menu |
| `greenfield-portal/login.html:1-3`, `register.html:1-3` | Authentication shell | `/login`, `/register` | Current legacy shell | Authored `.site-header` | Runtime shared footer via `navigation.js` | None | `navigation.css`, late `shared-site-shell.css` | Body scroll due late override | Preserve forms and auth; migrate outer shell |
| `greenfield-portal/temp_body.html`, `withHero.html`, `withStyle.html` | HTML fragments/work files | Not linked as production routes by the Worker | Legacy/work residue | No | No | No | Inline/fragment styles | Not applicable | Retire from deployable asset root after evidence-backed review |
| `greenfield-portal/work/**`, `index_files/**`, `.bak` files | Historical generated/deploy copies | Directly addressable as static assets if path is known | Legacy/generated residue | Duplicated | Duplicated | Duplicated | Copied CSS/JS | Independent | Remove from deployable asset root only in a later approved cleanup |

## Shared element implementations

### Top bar and primary header

1. Methodology header generated by `methodology-v10.js:32-39`.
2. Legacy `.site-header` authored into individual pages and filled by `navigation.js:20-48`.
3. Admin-specific `.admin-topbar` in `admin.html:5`.
4. Some migrated pages contain both `#methodology-header` and legacy `.site-header`; for example `pages/ai-architecture.html:5-13`. `navigation.css:1278` hides the legacy header on `.knowledge-theme-page`, rather than removing it.

### Footer

1. Methodology footer generated by `methodology-v10.js:40-44`.
2. Legacy footer markup in older pages.
3. Shared footer generated/overwritten by `shared-site-shell.js:10-27`.
4. `methodology-v10.js:45` asks the shared renderer to overwrite the methodology footer.

### Application shell

No single application-shell owner exists. HTML files own placeholders/markup, two JavaScript systems own header/footer rendering, and two global CSS files independently own root scrolling.

## Routes bypassing the principal methodology layout

- `/admin`: protected by `src/worker.js:730-735`, serves the admin-specific shell.
- `/login` and `/register`: served directly from static assets (`src/worker.js:48-50`), use legacy header shell.
- Legacy public pages without `#methodology-header`: `ai-adoption`, `ai-rpa-prioritization`, `architecture`, `document-processing`, `executive-career-portfolio`, `operational-risk`, `solutions`, `vendor-assurance`.
- Published D1-managed pages: can replace static `<main>` or generate a legacy managed document (`src/worker.js:694-727`).
- Direct static work/backup paths under the asset root can bypass current route conventions.

## Legacy/static duplication

Production asset discovery found 192 HTML documents after excluding `work/**` and `index_files/**`; the validator reports 188 production pages. Additional deploy-package copies, backup directories, `.bak` documents, fragments, and downloaded Webflow artifacts remain inside or beside the asset tree. The Worker uploads the entire `greenfield-portal` directory, so unexcluded residue is part of the asset bundle even when not linked.

