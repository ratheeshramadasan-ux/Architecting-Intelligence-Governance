# Portal content, theme, access, and terminology change summary

**Release branch:** `codex/portal-content-theme-audit`

**Release date:** 26 July 2026
**Phases covered:** 1–7 plus page-level access administration

## Outcome

The portal now uses a consistent production theme and navigation model, provides a searchable AI and technology glossary, introduces business-first decision summaries on every technical guidance page, and gives administrators one catalog for controlling and editing every production page.

## Files added

- `docs/portal-content-and-theme-audit.md`
- `docs/plain-language-writing-standard.md`
- `docs/page-access-and-admin-catalog.md`
- `docs/change-summary.md`
- `pages/ai-technology-glossary.html`
- `assets/js/glossary.js`
- `assets/js/contact.js`
- `scripts/validate-portal-links.mjs`
- `migrations/0005_page_access.sql`
- `migrations/0006_glossary.sql`
- `src/worker.js`

## Main files modified

- All production HTML files use the same shared asset version.
- `assets/css/navigation.css` contains the shared page, Admin, glossary, and decision-summary presentation.
- `assets/js/navigation.js` provides consistent fallback and managed navigation, keyboard controls, active states, and the Resources submenu.
- `assets/js/admin.js` lists all pages and manages visibility and sign-in requirements.
- `admin.html` provides the complete searchable page catalog and customization workspace.
- `pages/contact.html` now has associated labels, browser validation, accessible errors, and a working email handoff.
- `.assetsignore` keeps backups, test pages, working files, local runtime state, and Office lock files out of production assets.

## Pages rewritten

Business-first executive decision layers were added to:

- Agentic AI Governance
- AI Adoption and Enterprise Tool Migration
- AI Architecture and Runtime Implementation
- Enterprise AI Automation Spectrum
- AI Governance, Compliance and Oversight
- AI Infrastructure Architecture
- AI and RPA Opportunity Prioritization
- Enterprise Architecture
- Enterprise AI Assurance
- Automation Framework
- Data Security and Privacy
- Intelligent Document Processing
- Governance Integration Model
- Greenfield AI Governance Blueprint
- Operational and Behavioural Risk
- Security and Architecture Review
- Enterprise AI and Automation Solutions
- Vendor, Infrastructure and Lifecycle Risk

Detailed implementation content remains on the original routes. No production page was split or removed.

## Glossary

The central glossary includes stable anchors, an A–Z index, live filtering, related terms, and links to relevant portal pages. Initial coverage includes agents, agentic AI, APIs, ABAC, control planes, DLP, embeddings, evaluation, guardrails, HITL, IAM, inference, LLMs, least privilege, MCP, model drift, model runtime, PII, prompt injection, production readiness, RACI, RAG, RBAC, RPA, SIEM, SLAs, skills, TCO, and vector databases.

## Theme and navigation

- Shared theme and cache versions are standardized across production pages.
- Desktop dropdown, keyboard arrow navigation, Escape handling, focus return, mobile menu labels, and active route matching are centralized.
- Resources is now a submenu containing Downloads and the AI & Technology Glossary.
- Database-managed navigation filters hidden pages.

## Page access and administration

- Every production content route is present in the Admin page catalog.
- An administrator can mark a page visible or hidden.
- An administrator can require sign-in independently for each page.
- Hidden pages are removed from navigation and return not found to public visitors; administrators can still preview them.
- Protected pages redirect anonymous visitors to sign-in and preserve the intended destination.
- Existing static content can be loaded into the customization editor without manually recreating it.

## Validation performed

- Wrangler production dry run after every phase.
- JavaScript syntax checks for shared navigation, glossary, Admin, contact, authentication, and Worker code.
- Static validation of 27 production HTML pages.
- Local target resolution for HTML, CSS, JavaScript, images, and downloads.
- Duplicate HTML ID checks.
- Required title, meta description, H1, and image alternative-text checks.
- Page-access API checks for visible, hidden, sign-in-required, administrator preview, and navigation filtering.
- Desktop and mobile Admin catalog checks during the page-access phase.
- Staged-diff whitespace and local credential/path scans.

## Files retained but excluded from production

Backup pages, `work/`, `index_files/`, local Wrangler state, local server PID files, temporary HTML fragments, the duplicate `solutions_test.html`, workbook source copies, and Office lock files remain available locally but are excluded from the production asset upload.

## Remaining risks

- Final interactive glossary, contact form, keyboard, and responsive checks must be performed against the live deployment.
- Database migrations `0005_page_access.sql` and `0006_glossary.sql` must complete before the new Worker is deployed.
- Regulatory and standards applicability remains organisation-, jurisdiction-, and use-case-specific and requires qualified review.
- The first glossary release covers the portal’s most important recurring terms; later editorial reviews should add specialised terms as they are introduced.

## Deployment checklist

1. Confirm the staged release contains no unrelated local files.
2. Run `node scripts/validate-portal-links.mjs`.
3. Run `npm run check`.
4. Apply remote D1 migrations.
5. Deploy the Worker and static assets.
6. Verify the live home page, glossary search and anchors, navigation, sign-in redirect, Admin catalog, and contact form at desktop and mobile widths.
