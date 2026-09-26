# Recovery Audit 03 — Route and Component Matrix

## Route families

| Route family | Actual page source | Header owner | Footer owner | Hero | Page-topic navigation | CSS dependencies | Layout status |
|---|---|---|---|---|---|---|---|
| `/` | `greenfield-portal/index.html`, optionally D1-managed replacement | `methodology-v10.js` | Methodology renderer then shared renderer | `.platform-hero`, optionally hidden/replaced by UX-1 | None in static home because `setupPageSubmenu()` exits for `home`; a D1-managed main may contain `.managed-left-nav` | methodology + home + UX-1 + late shared shell | Current, data-dependent, not one shell |
| `/transformation/` | `transformation/index.html` + methodology data | Methodology JS | Methodology/shared | `.methodology-hero` | Generated `.page-submenu` | methodology + shared shell | Current vertical reading-menu variation |
| `/transformation/stage-0-mobilise/` | authored Stage 0 HTML + `mobilise-content.json` | Methodology JS | Methodology/shared | `.stage-hero` | Authored `.stage-nav` | methodology + shared shell | Unique vertical stage-menu variation |
| `/transformation/stage-1-discover/**` | generated HTML + discover scripts/data | Methodology JS | Methodology/shared | detail/stage variants | Generated page submenu plus route-specific dashboard/detail controls | methodology + shared shell | Generated route family |
| `/transformation/stage-2-assess-readiness/**` | generated HTML + readiness scripts/data | Methodology JS | Methodology/shared | detail/stage variants | Generated page submenu plus route-specific controls | methodology + shared shell | Generated route family |
| `/assessments/**` | generated assessment HTML + assessment scripts/data | Methodology JS | Authored placeholder/shared overwrite | detail/assessment variants | Generated `.page-submenu` | methodology + shared shell | Generated route family |
| `/deliverables/**`, `/tools/**`, `/journey/**` | static/generated HTML and platform scripts | Methodology JS | Methodology/shared | detail variants | Generated `.page-submenu` | methodology, sometimes platform CSS, shared shell | Current generated families |
| `/pages/knowledge-discovery.html` | page HTML + `knowledge-discovery.js` | Methodology JS | Methodology/shared | `.detail-hero` | Generated `.page-submenu` from page H2s | methodology + platform + shared shell | Current search/browse page, not sequential |
| Migrated knowledge pages, e.g. `ai-architecture`, `ai-governance`, `agentic-ai` | legacy content embedded under methodology placeholder | Methodology JS; some retain a second legacy header | Methodology/shared | legacy article hero and sometimes UX replacement hero | Generated methodology submenu or legacy section nav depending script set | legacy + navigation + methodology + optional UX + shared shell | Coexisting old/new layouts |
| Legacy public pages, e.g. `ai-adoption`, `architecture`, `document-processing`, `operational-risk`, `solutions`, `vendor-assurance` | individual page HTML | Authored `.site-header` + `navigation.js` | Authored/runtime shared | legacy article hero | Runtime legacy `.section-nav` on eligible long pages | legacy + navigation + shared shell | Legacy shell |
| `/login`, `/register` | `login.html`, `register.html` | Authored legacy header + navigation JS | Runtime shared footer | Auth card | None | navigation + shared shell | Functional legacy shell |
| `/admin` | `admin.html`, protected by Worker | Admin-specific topbar | None | None | Admin module sidebar only | navigation + admin | Functional exception; public shell bypass |
| Published managed `/` or `/pages/*` | D1 `content_pages` + Worker renderer | Base static header or generated legacy header | Runtime navigation/shared footer when scripts load | `.managed-hero` | `.managed-left-nav` when configured | navigation + shared shell | Dynamic legacy-layout bypass |

## Shared-component inventory

| Component | File / code section | Routes | Current / legacy | Header | Footer | Page nav | Scroll behaviour | Conflict | Action |
|---|---|---|---|---|---|---|---|---|---|
| Methodology shell renderer | `assets/js/methodology-v10.js:32-46` | 177 methodology documents | Current | Yes | Yes | Indirect | Depends on methodology root rules | Footer immediately eligible for overwrite | Retain data-driven nav model; move render ownership to one shell |
| Canonical legacy navigation | `assets/js/navigation.js:20-48` | 11 script-linked pages and managed documents | Legacy/current functional | Fills existing nav only | Loads shared footer script | Generates separate section nav later | Legacy fixed-shell rules initially work | Different markup/data source from methodology navigation | Migrate navigation data, retire renderer |
| Shared footer renderer | `assets/js/shared-site-shell.js:10-27` | Both shell families | Current regression source | No | Yes | No | Forces document scroll through its CSS | Overwrites methodology footer and root overflow | Keep footer content contract; replace runtime injection |
| Methodology page submenu | `methodology-v10.js:192-235` | Most methodology routes except home/stage-nav pages | Current variation | No | No | Yes, vertical on desktop | Inside centre main | Contradictory CSS generations | Replace with horizontal shared navigator |
| Stage 0 nav | `stage-0-mobilise/index.html:21-26` | Stage 0 only | Current variation | No | No | Yes, vertical | Sticky inside stage grid | Bypasses generated menu | Migrate first pilot |
| Legacy section nav | `navigation.js:189-249`; `navigation.css:1025-1059` | Eligible legacy pages | Legacy | No | No | Yes, vertical | Fixed/sticky rail | Competes with hero/content and methodology menu | Retire during route batches |
| Managed left nav | `src/worker.js:716-723` | D1-managed pages with `left_nav_json` | Current dynamic variation | No | No | Yes, vertical | Managed grid | Reintroduces sidebar even if static route is migrated | Map config to shared horizontal navigator |
| UX-1 hero replacement | `ux1-visual-system.js`; `ux1-visual-system.css:57` | Home/governance/agentic pilots | Current enhancement | No | No | No | In inherited main | Hides another hero rather than owning one canonical hero | Retain visual assets; remove duplicate hero lifecycle |

## Routes with explicit duplicate header markup

The following audited files contain both a methodology-header placeholder and legacy `.site-header` markup:

- `pages/ai-architecture.html`
- `pages/ai-automation-spectrum.html`
- `pages/ai-infrastructure-architecture.html`
- `pages/ai-technology-glossary.html`
- `pages/assurance.html`
- `pages/automation.html`
- `pages/data-security.html`
- `pages/governance-integration.html`
- `pages/greenfield-implementation.html`
- `pages/resources.html`
- `pages/security-review.html`

Some legacy markup is commented out; some remains in the DOM and is hidden through `navigation.css:1278`. This is concealment, not architectural removal.

## Routes without methodology header

Canonical exceptions:

- `admin.html`
- `login.html`, `register.html`
- legacy content pages: `ai-adoption`, `ai-rpa-prioritization`, `architecture`, `document-processing`, `executive-career-portfolio`, `operational-risk`, `solutions`, `vendor-assurance`
- noncanonical residue: `solutions_test.html`, `temp_body.html`, `withHero.html`, `withStyle.html`

## Generated/static overwrite risk

The build scripts under `scripts/build-*.mjs` generate large route families. They can overwrite manually corrected HTML if templates remain unchanged. The whole `greenfield-portal` directory is uploaded as assets, including generated route families and historical copies. Any recovery must update generator templates/contracts before regenerating, and must never regenerate all pages merely to alter the shell.

