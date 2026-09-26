# Recovery Audit 02 — Style Inventory

## Summary

There is no CSS module system. All styles are global stylesheets or inline page styles. CSS is linked per HTML document and one stylesheet is injected dynamically at runtime. No global CSS entry point is imported once at a true root.

Audited production-style imports:

| Stylesheet | Import location / count | Routes affected | Shared selectors and conflicts | Recommendation |
|---|---|---|---|---|
| `assets/css/methodology-v10.css` | Direct link in 178 HTML files | Homepage, lifecycle, assessments, knowledge, deliverables, tools | Defines root tokens, `html/body/main` scroll (`:80`), methodology header/footer, all hero families, `.page-submenu`, `.stage-nav`; contains earlier vertical menu rules (`:29-39`) and later competing reading-layout rules (`:82,86-109`) | Retain domain/component rules temporarily; extract one shell contract, remove historical overrides |
| `assets/css/navigation.css` | 24 relative imports plus 3 absolute imports | Legacy pages, auth, admin, managed pages | Defines legacy header/footer, heroes, managed pages, admin; fixed-shell rules at `:995-1000`; fixed header at `:1103-1105`; vertical `.section-nav` at `:1025-1059`; managed left nav and hero at `:1209-1211` | Split shell contract from legacy/page/admin rules; stop using it as universal catch-all |
| `assets/css/shared-site-shell.css` | Injected by `shared-site-shell.js:4-9`, not linked at root | Every page loading navigation or methodology JavaScript | Re-declares `html`, `body`, `main`, footer; `:17-18` explicitly changes root to `height:auto; overflow:visible` and main to `overflow-y:visible` | Replace with compact-footer component styles inside the one global entry; remove root-scroll overrides |
| `assets/css/home-platform-v10.css` | Homepage only | `/` static main | Repeats `.platform-hero-grid` and `.platform-hero h1` at lines 1, 5, 10-12; initial `clamp(...5.3rem)` is later reduced by same-file overrides; contains no approved background image | Consolidate homepage-only content styles; use shared hero tokens |
| `assets/css/ux1-visual-system.css` | Homepage plus two migrated feature pages | Home, governance, agentic pages | Defines `.ux-hero`; hides original `.platform-hero`/`.article-hero` when JS adds `.ux1-ready` (`:57`); adds another hero ownership layer | Retain specialised diagrams; remove responsibility for standard hero replacement |
| `assets/css/platform-sections.css` | 5 routes | Knowledge centre, deliverables/tools-style routes | Content grids, search/results, cards; no root shell ownership | Retain as domain styles, later import through global entry |
| `assets/css/legacy-visuals.css` | 24 legacy page imports | Legacy public content | Own root tokens, `body` and hero (`:14-24`) that overlap navigation/methodology CSS | Freeze during migration, then retire after route batches |
| `assets/css/admin.css` | Admin only | `/admin` | Administration workspace and controls | Retain isolated; do not merge public page-menu rules into it |
| `assets/css/methodology.css` | No current production import found | Prior methodology generation | Duplicates methodology rules | Legacy; verify no external reference, then retire |
| `assets/css/home-platform.css` | No current production import found | Prior homepage generation | Duplicates home-platform rules | Legacy; retire after visual diff |
| `assets/css/index_files/navigation.css` and `legacy-visuals.css` | Web/download artifact | Static artifact paths | Duplicate old site styles | Remove from deployable root after archive decision |
| `work/deploy-package-*/assets/css/*` | Historical package copies | Direct static paths only | Duplicate production CSS | Move outside deployable asset root |

## CSS import inventory

Current audited HTML import counts:

- `/assets/css/methodology-v10.css`: 178
- `../assets/css/legacy-visuals.css`: 24
- `../assets/css/navigation.css`: 24
- `/assets/css/platform-sections.css`: 5
- `/assets/css/navigation.css`: 3
- UX-1 visual stylesheet: 3 total
- admin, homepage and authentication-specific files: route-specific

The stylesheet injected by `shared-site-shell.js` is absent from HTML source, so source-only audits miss its cascade position and root-layout override.

## Root and overflow declarations

| File and line | Declaration | Effect |
|---|---|---|
| `navigation.css:995-1000` | `html,body{height:100%;overflow:hidden}` and `body>main{overflow-y:auto}` | Correct fixed-shell centre-scroll pattern for legacy shell |
| `navigation.css:1103-1105` | body top padding and fixed `.site-header` | Keeps legacy header stationary |
| `methodology-v10.css:80` | Same root lock and centre-scroll pattern | Correct fixed-shell pattern for methodology routes |
| `shared-site-shell.css:12-18` | `height:auto;overflow:visible` on `html/body`; visible overflow on `main` | Loaded later and reverses both fixed-shell implementations |
| `legacy-visuals.css:17-18` | smooth root scrolling and `body min-height:100vh` | Legacy document-scrolling assumptions |

## Header and footer rules

- Methodology header: sticky at `methodology-v10.css:42`; root flex-shell at `:80`.
- Legacy header: fixed at `navigation.css:1103-1104`.
- Shared footer: explicitly `position:static` at `shared-site-shell.css:19`.
- Legacy/footer definitions occur repeatedly in `navigation.css` around lines 6, 15, 277-299, 633-650, 708-711, and 941-943.
- Methodology footer styles occur at `methodology-v10.css:44` and are subsequently overwritten in markup by `shared-site-shell.js`.

## Hero rules

Hero ownership is duplicated across:

- `methodology-v10.css:3-22,43,82` for methodology/stage/detail heroes;
- `home-platform-v10.css:1,5-12` for homepage hero, with repeated same-selector overrides;
- `navigation.css` for legacy `.hero`, `.article-hero`, managed hero, and page-specific compacting;
- `ux1-visual-system.css:12-29,57` for replacement UX heroes;
- inline page blocks in `ai-automation-spectrum.html:12,275` and `executive-career-portfolio.html:2`.

Hard-coded brand values (`#08264a`, `#061d38`, `#c3912f`, cream variants) are redeclared independently in methodology, navigation, shared footer, UX-1, legacy visuals, and managed-page rendering (`src/worker.js:717-723`).

## Page-menu rules

1. `.page-submenu`: generated by methodology JS; styled once as fixed 310px left rail (`methodology-v10.css:29-39`), once as horizontal sticky bar (`:82`), then as a 250px vertical reading-layout column (`:86-109`). The last applicable desktop rules win.
2. `.stage-nav`: authored into Stage 0; vertical grid layout at `methodology-v10.css:45-46`.
3. `.section-nav`: generated by legacy navigation JS; fixed/sticky vertical layout at `navigation.css:1025-1059,1141-1159`.
4. `.managed-left-nav`: generated by Worker-managed pages at `src/worker.js:722-723`, styled by `navigation.css`.

## Inline styles and style blocks

- `pages/ai-automation-spectrum.html:12` contains a large page-local style block; `:275` adds a second body rule.
- `pages/executive-career-portfolio.html:2` contains a page-local style block.
- `temp_body.html` has ten `style=` attributes, but is a work fragment rather than a canonical route.
- `methodology-v10.js:211` writes `scrollMarginTop` inline.
- `src/worker.js:723` emits managed-page CSS custom properties in an inline `style` attribute.

These are not CSS modules; they participate in the global cascade or are runtime inline styles.

