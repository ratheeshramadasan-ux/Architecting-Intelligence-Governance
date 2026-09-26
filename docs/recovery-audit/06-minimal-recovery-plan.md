# Recovery Audit 06 — Minimal Recovery Plan

No implementation is performed by this audit. Each commit below is independently testable and reversible.

## Commit 1 — Restore or establish one shared application shell without changing page content

- **Files to change:** introduce one shared shell renderer/module; root HTML templates/generator templates; Worker managed-document wrapper; shell contract tests.
- **Files not to change:** page body content, D1 migrations/data, R2, page-specific domain scripts, admin APIs.
- **Visual result:** identical content inside one top bar/header/main/footer structure.
- **Functional result:** all routes retain existing links/forms/scripts and managed-page replacement.
- **Automated test:** route crawl asserts exactly one top bar, one primary header, one main and one footer; no duplicate IDs.
- **Manual test:** home, Stage 0, knowledge, governance, technical, auth, admin, one managed page.
- **Rollback:** revert only Commit 1; no data migration required.

## Commit 2 — Make only the central content viewport scroll

- **Files to change:** single global shell stylesheet and shell scroll test.
- **Files not to change:** page/menu/hero content styles, route HTML bodies, APIs.
- **Visual result:** top bar/header/footer stationary; centre region scrolls.
- **Functional result:** anchor links and focus scrolling remain visible.
- **Automated test:** computed styles assert root overflow hidden and main overflow-y auto at desktop/tablet/mobile.
- **Manual test:** wheel, keyboard, touch, skip link, long page, modal.
- **Rollback:** revert root-layout declarations.

## Commit 3 — Restore the shared compact footer on every route

- **Files to change:** shared footer component and global shell stylesheet; route shell templates.
- **Files not to change:** page content, admin modules/APIs, D1/R2.
- **Visual result:** one compact footer in the stationary shell.
- **Functional result:** footer branding/accessibility consistent on every public/auth route.
- **Automated test:** one `contentinfo` per route; accessible name; no overflow.
- **Manual test:** desktop/tablet/mobile and supported themes.
- **Rollback:** revert footer component/template wiring.

## Commit 4 — Create one shared HorizontalPageTopicNavigator component

- **Files to change:** shared navigator module, global stylesheet, configuration adapter for static headings and managed `left_nav_json`.
- **Files not to change:** route bodies or Stage 0/home integration yet.
- **Visual result:** horizontal expandable topic navigator specification available but not broadly mounted.
- **Functional result:** keyboard, disclosure, anchors, active state.
- **Automated test:** component contract, ARIA state, keyboard and overflow tests.
- **Manual test:** isolated fixture at all breakpoints.
- **Rollback:** remove unused component.

## Commit 5 — Migrate homepage and Stage 0 only

- **Files to change:** homepage shell/config, Stage 0 template/config, managed-home adapter, route-specific tests.
- **Files not to change:** other 190 route documents, content data, admin/CMS, global domain styles.
- **Visual result:** hero precedes one horizontal navigator; no vertical sidebar.
- **Functional result:** all homepage and Stage 0 anchors, lifecycle controls, checklists and links remain operational.
- **Automated test:** exact DOM order `hero -> topic navigator -> content`; absence of `.stage-nav`, `.page-submenu`, `.managed-left-nav`.
- **Manual test:** compare static and D1-managed homepage; Stage 0 desktop/tablet/mobile.
- **Rollback:** revert only two route adapters.

## Commit 6 — Validate those two routes before migrating any other page

- **Files to change:** tests, screenshots and validation documentation only.
- **Files not to change:** application presentation or content.
- **Visual result:** no change.
- **Functional result:** evidence gate for wider migration.
- **Automated test:** full validation suite, link/accessibility checks, visual snapshots.
- **Manual test:** signed-out/signed-in/admin states; long-scroll and anchor review.
- **Rollback:** revert evidence files only.

## Commit 7 — Migrate remaining routes in small route batches

- **Files to change:** generator/template contracts and small named route batches (suggested: lifecycle; assessments; knowledge; governance; technical; remaining legacy).
- **Files not to change:** unrelated batches, content data, admin APIs, D1/R2.
- **Visual result:** same horizontal navigator and shell, route content unchanged.
- **Functional result:** domain interactions remain intact.
- **Automated test:** batch-specific route matrix plus global shell assertions.
- **Manual test:** at least one short and one long page per batch.
- **Rollback:** revert the failing batch only; never regenerate 187 pages for a shell change.

## Commit 8 — Consolidate shared visual styling under one global CSS entry point

- **Files to change:** one global CSS entry; imports of retained domain styles; remove shell/header/footer/hero/menu ownership from page files.
- **Files not to change:** content markup, D1/R2, functional JS.
- **Visual result:** no intended visual delta from accepted pilot.
- **Functional result:** deterministic cascade and one brand/token source.
- **Automated test:** CSS ownership lint forbids protected selectors outside global entry; route screenshots.
- **Manual test:** cascade inspection on representative route families.
- **Rollback:** revert import consolidation while retaining accepted component markup.

## Commit 9 — Restore and validate administration and CMS feature parity

- **Files to change:** only integration defects found by tests, admin shell adapter, test fixtures.
- **Files not to change:** existing records, destructive migrations, R2 objects, public content.
- **Visual result:** administration remains usable in its approved design language.
- **Functional result:** dashboard, pages, workflow, versions, templates, uploads, media, users, roles, auth, protection, search and analytics pass.
- **Automated test:** authenticated API integration matrix and data-retention assertions.
- **Manual test:** complete admin workflow with test records.
- **Rollback:** revert integration fixes; additive test records cleaned only through approved test teardown.

## Commit 10 — Reduce homepage hero typography and add approved consulting background

- **Files to change:** homepage content configuration, shared hero variant tokens, approved image asset reference.
- **Files not to change:** shell, other pages, homepage business content, admin/CMS.
- **Visual result:** restrained centrally controlled type and approved professional consulting banner.
- **Functional result:** CTA/search links unchanged.
- **Automated test:** computed type-size bounds and image accessibility/performance checks.
- **Manual test:** desktop/tablet/mobile visual approval.
- **Rollback:** revert homepage variant configuration and asset reference.

## Commit 11 — Rebuild Knowledge Discovery as a sequential activity progression

- **Files to change:** `pages/knowledge-discovery.html`, `assets/js/knowledge-discovery.js`, knowledge-domain styles/config, tests.
- **Files not to change:** knowledge D1 schema/content, search API, feedback API, other routes.
- **Visual result:** explicit sequence such as frame question → search evidence → inspect result → follow related guidance → record feedback.
- **Functional result:** current search, audience selection, grounded fallback, deep links and feedback remain intact.
- **Automated test:** sequential DOM/ARIA contract plus search/fallback/feedback integration.
- **Manual test:** executive, practitioner and technical journeys; empty/error states.
- **Rollback:** revert presentation/interaction commit; knowledge records remain unchanged.

## Mandatory gates

- No production deployment.
- No bulk page rewrite.
- No new feature/content work during structural recovery.
- No migration beyond homepage and Stage 0 until Commit 6 is approved.
- Every implementation commit must include screenshots and automated evidence.

