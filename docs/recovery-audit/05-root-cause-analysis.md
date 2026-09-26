# Recovery Audit 05 — Root-Cause Analysis

## 1. Browser body scrolls instead of only the centre region

The intended rules exist twice:

- `navigation.css:995-1000`
- `methodology-v10.css:80`

Both lock `html/body` and make `body>main` the scrolling viewport. However, `shared-site-shell.js:4-9` appends `shared-site-shell.css` after the page styles. Its lines 17-18 set `html/body` to `height:auto; overflow:visible` and `main` to `overflow-y:visible`. Because it loads later and uses specific `:has()` selectors, it reverses the intended shell.

## 2. Header and footer scroll with the document

Once root document scrolling is restored by `shared-site-shell.css:17-18`, the footer’s explicit `position:static` (`:19`) makes it document-end content. Methodology header is only `sticky` (`methodology-v10.css:42`) and legacy header is fixed (`navigation.css:1104`), producing different behaviours across route families.

## 3. Footer appears only at page end

The footer renderer appends a footer at the end of `body` when one is absent (`shared-site-shell.js:11-14`) and styles it as static (`shared-site-shell.css:19`). The same stylesheet disables centre-region scrolling, so the footer can only be reached at document end.

## 4. Homepage and lifecycle pages use different page menus

- Homepage is explicitly excluded from `setupPageSubmenu()` (`methodology-v10.js:193`).
- Most methodology routes receive generated `.page-submenu` (`:192-235`).
- Stage 0 short-circuits generation because `.stage-nav` already exists (`:194`) and uses authored vertical markup (`stage-0-mobilise/index.html:21-26`).
- Legacy pages can receive a separate `.section-nav` from `navigation.js:189-249`.

There is no shared page-topic component.

## 5. Homepage menu remains vertical

The static homepage currently has no generated page submenu, but the visible homepage may be a D1-managed page. `serveManagedPage()` runs before static assets (`worker.js:64,694-713`) and `renderManagedMain()` emits `.managed-left-nav` whenever `left_nav_json` exists (`worker.js:722-723`). Thus a managed homepage can display a vertical menu even though static `index.html` does not.

## 6. Hero width is reduced by the sidebar

Two implementations create a sidebar/content grid:

- `.page-reading-layout` uses `250px minmax(0,1fr)` (`methodology-v10.css:91-93`);
- managed pages render nav and content inside `.managed-layout` (`worker.js:723`; navigation styles).

Stage 0 separately uses `240px minmax(0,1fr)` (`methodology-v10.css:45`). Earlier rules also applied `padding-left:310px` to the whole main (`:29`), demonstrating successive, conflicting attempts to compensate for a fixed rail.

## 7. Hero typography differs or becomes oversized

Hero typography is owned by at least four global files and the Worker renderer:

- methodology generic `h1` permits up to `5.2rem` (`methodology-v10.css:43`);
- later methodology hero override limits it (`:82`);
- homepage file initially permits `5.3rem`, then redefines the same selector three times (`home-platform-v10.css:1,5-12`);
- legacy navigation owns `.article-hero` and home scales;
- UX-1 can hide the original hero entirely (`ux1-visual-system.css:57`);
- managed pages generate their own hero and inline theme variables (`worker.js:717-723`).

The rendered result depends on route, class, load order, data source, and whether UX JavaScript completes.

## 8. Page-level styles override shared styles

`ai-automation-spectrum.html:12,275` and `executive-career-portfolio.html:2` contain page-local style blocks. More broadly, “page-level” files such as `home-platform-v10.css` load after methodology CSS and repeatedly redefine shared hero selectors. Runtime-injected `shared-site-shell.css` loads after all authored links. Specificity, `!important` use (`methodology-v10.css:6`), and load order replace a defined ownership model.

## 9. Admin functionality disappeared or became inaccessible

The implementation is present. Accessibility can fail because:

- `/admin` requires an active admin session (`worker.js:730-735`);
- methodology header renders an Administration link for everyone (`methodology-v10.js:36`), which can lead non-admin users to a 403;
- legacy header adds Administration only after `/api/auth/me` returns an admin (`navigation.js:91-96`);
- migrated pages sometimes hide the legacy header (`navigation.css:1278`), removing the only conditional account menu;
- missing production migrations/configuration would make the UI load but API calls fail.

This is discoverability/configuration divergence, not evidence that the source feature was removed.

## 10. Local preview and deployed output differ

Four concrete mechanisms can diverge:

1. D1-managed page replacement occurs before static assets (`worker.js:64,694-713`).
2. Local and production D1 rows/migrations can differ.
3. `wrangler.rc1.jsonc` uses `src/preview-worker.js`, while the main configuration uses `src/worker.js`.
4. The complete `greenfield-portal` asset directory is uploaded, including generated and legacy copies; cached/versioned URLs can select different files.

## 11. Legacy and redesigned layouts coexist

Evidence includes:

- pages with methodology header placeholders plus retained legacy `.site-header` markup (for example `pages/ai-architecture.html:5-13`);
- `navigation.css:1278` hides the legacy header rather than removing it;
- 24 legacy CSS imports remain alongside 178 methodology imports;
- separate navigation data sources: D1 `menu_items` for legacy navigation and `methodology.json` for methodology navigation;
- runtime footer overwrite from a third shared-shell script;
- D1 managed rendering can reintroduce legacy managed markup after a static page migration.

## Git history finding

Commit `8a5c391` (“Standardise shared theme and navigation references”) contains the working fixed-shell rules in `greenfield-portal/assets/css/navigation.css:995-1000`: locked root, flex body, central `main` scrolling. Those same rules remain in the working tree. The regression is caused by the later untracked runtime `shared-site-shell.css`, not by absence of the old rules.

Because `shared-site-shell.css`, methodology-v10 assets, and many route families are untracked in the current working tree, Git cannot identify a committed revision where the entire current portal had fixed-shell behaviour. `8a5c391` is the last discoverable committed legacy-shell baseline, not proof that every current methodology route worked there.

