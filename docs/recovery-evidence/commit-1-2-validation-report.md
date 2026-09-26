# Commit 1 and Commit 2 validation report

## Authorized scope

- Commit 1: establish one shared application shell without changing page content.
- Commit 2: make the central content region the only vertical scrolling container.
- Commit 3 and later recovery work were not started.

## Implementation ownership

- Root public shell: `body.application-shell[data-shared-shell="true"]`
- Root shell renderer: `greenfield-portal/assets/js/shared-site-shell.js`
- Single global shell stylesheet: `greenfield-portal/assets/css/shared-site-shell.css`
- Main content host: the existing direct child `<main>`, marked `data-shell-region="main"`
- Static and database-managed page content remains inside that existing `<main>`.

The renderer selects one direct header, main and footer. If both a methodology header and a legacy header exist, the methodology header is canonical and the other direct header is removed. The same reconciliation is applied to direct footers. It does not rewrite article markup.

## Viewport and scrolling rules

`shared-site-shell.css` owns these declarations:

```css
html {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body.application-shell {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

body.application-shell > [data-shell-region="header"],
body.application-shell > [data-shell-region="footer"] {
  position: relative;
  flex: 0 0 auto;
}

body.application-shell > [data-shell-region="main"] {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
}
```

No inline shell styles, route-specific offsets, or new `!important` declarations were added.

## Regression cause removed

The late-loaded `shared-site-shell.css` previously contained:

```css
html:has(body > .shared-enterprise-footer),
body:has(> .shared-enterprise-footer) {
  height: auto;
  overflow: visible;
}

body:has(> .shared-enterprise-footer) > main {
  overflow-y: visible;
}
```

Those rules made the browser document the scrolling container and overrode the earlier fixed-shell declarations. They were removed. Duplicate viewport ownership was also removed from the late section of `methodology-v10.css`.

## Worker rendering

`renderManagedMain()` already returns a content `<main>` fragment rather than a complete application shell.

`renderManagedDocument()` is used only when no source HTML document can be wrapped. That fallback now loads the same shared shell CSS and renderer, emits one header and one empty footer host, and inserts the managed `<main>` between them. Database queries, managed content sanitation, access checks and administration behavior were not changed.

## Automated results

- `npm run validate:shell`: PASS
- `node --check greenfield-portal/assets/js/shared-site-shell.js`: PASS
- `node --check src/worker.js`: PASS
- `npm run check`: PASS (`wrangler deploy --dry-run`; no deployment)
- Browser runtime matrix: 20/20 public-route/viewport combinations passed.

Every public-route matrix check asserted:

- one shared shell;
- one direct header;
- one direct main;
- one direct footer;
- `html` and `body` overflow hidden;
- main `overflow-y: auto`;
- document scroll position remained zero;
- header and footer rectangles were unchanged at top, middle and bottom;
- no horizontal document overflow.

| Viewport | Home | Knowledge Discovery | Governance | Agentic AI | Stage 0 |
|---|---:|---:|---:|---:|---:|
| 1440 × 900 | Pass | Pass | Pass | Pass | Pass |
| 1280 × 800 | Pass | Pass | Pass | Pass | Pass |
| 1024 × 768 | Pass | Pass | Pass | Pass | Pass |
| 390 × 844 | Pass | Pass | Pass | Pass | Pass |

The authenticated `/admin` application was opened and visually checked without changing its markup, APIs or functionality. It deliberately remains outside the public shared-shell adapter in this phase.

## Route note

The requested `/pages/enterprise-ai-governance` path returns the repository's existing 404 response. The implemented governance page is `/pages/ai-governance.html`; that page was used for shell and viewport validation. No alias or route migration was introduced because bulk route migration and new feature work were explicitly excluded.

## Screenshot evidence

Each route below has viewport screenshots at top, middle and bottom at 1440 × 900:

- Home: `home-{top,mid,bottom}-1440x900.png`
- Knowledge Discovery: `knowledge-discovery-{top,mid,bottom}-1440x900.png`
- Enterprise AI Governance implementation: `enterprise-ai-governance-{top,mid,bottom}-1440x900.png`
- Agentic AI: `agentic-ai-{top,mid,bottom}-1440x900.png`
- Stage 0 Mobilise: `stage-0-mobilise-{top,mid,bottom}-1440x900.png`
- Administration: `administration-auth-gate-{top,mid,bottom}-1440x900.png`

All screenshots are stored in `docs/recovery-evidence/screenshots/`.

## Scope confirmation

- No page or article content was changed.
- No hero copy was changed.
- No page-menu content or format was changed.
- No database content or migrations were changed.
- No administration functionality was changed.
- No route migration was performed.
- No production deployment occurred.
- Commit 3 and later recovery work were not started.
