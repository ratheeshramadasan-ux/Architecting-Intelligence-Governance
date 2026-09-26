# Portal Content and Theme Audit

**Audit date:** 26 July 2026

**Audit scope:** Phase 1 only — repository, production-page, content, theme, navigation, accessibility, and static-link review

**Authoritative source:** the current local `greenfield-portal` directory

**Audit branch:** `codex/portal-content-theme-audit`

## Executive finding

The portal has a recognisable enterprise design, a central navigation implementation, and substantial technical depth. Its main production risk is not missing subject matter; it is that important guidance is often presented at implementation depth before the business meaning and decision context are clear.

The audit identified 26 likely production HTML pages, two shared production CSS files, and four shared production JavaScript files. Static analysis found no duplicate HTML IDs, missing image `alt` attributes, broken local file targets, or broken local fragment links in the production set. The highest-priority issues are:

1. Four unusually dense pages need layered, plain-language restructuring. `agentic-ai.html` is the largest at approximately 5,000 visible words.
2. Important abbreviations and technical terms are used without reliable first-use explanations. There is no central glossary.
3. Visible character-encoding corruption (mojibake) appears on multiple production pages and in `navigation.js`.
4. Shared asset cache versions are inconsistent, and three pages retain embedded CSS.
5. The contact form has an undefined inline event handler and labels that are not explicitly associated with controls.
6. The home page has no `<h1>`. `ai-automation-spectrum.html` and `contact.html` contain heading-level jumps.
7. The default navigation is centralised, but a runtime navigation response can replace it. Both paths must be kept aligned when the glossary is added.
8. The repository contains backups, duplicate deployment packages, temporary content, a duplicate test page, and two empty HTML placeholders. These are documented for later confirmation, not deletion.

No portal-wide rewrite, glossary implementation, shared-theme refactor, cleanup, or route change was performed during this phase.

## Repository state and change safety

The parent repository was already dirty before this audit:

- Current starting branch: `greenfield-ai-governance-redesign`
- Modified: parent `.gitignore` and parent `index.html`
- Deleted: parent `wrangler.toml`
- Untracked: the complete `greenfield-portal` directory, `greenfield-portal - backup`, `migrations`, `package.json`, `package-lock.json`, `scripts`, `src`, and `wrangler.jsonc`

The audit branch was created without staging or altering those existing changes. Because the authoritative portal directory is untracked as a unit, future commits need especially careful scope review. A rollback point should be created before Phase 2 by committing only the agreed portal baseline and audit, or by otherwise recording a user-approved baseline.

## Audit method and limitations

The audit used repository inventory, HTML and asset-reference scans, content-density counts, heading and ID checks, local link and fragment resolution, image-alternative-text checks, shared asset/version comparison, duplicate hashing, acronym heuristics, and targeted source inspection.

Limitations:

- This was a static audit. Desktop, mobile, keyboard, focus, overflow, and runtime API behaviour were not exercised in a browser.
- External URLs were inventoried but not network-validated.
- `/api/auth/google` on `login.html` and `register.html` is a runtime endpoint, not a local file. Its availability requires a running deployment.
- Navigation may be replaced by `/api/navigation`; the runtime-managed menu was not available during static analysis.
- Acronym detection is heuristic. It identifies likely review targets, not every semantic first use.
- The parent project exposes `npm run check` as a Wrangler dry-run, but Phase 1 did not run a deployment-oriented check or modify Cloudflare configuration.

## Production inventory

### Production HTML routes

The likely production set contains 26 pages:

- Root: `index.html`, `admin.html`, `login.html`, `register.html`
- Content: `pages/about.html`, `pages/agentic-ai.html`, `pages/ai-adoption.html`, `pages/ai-architecture.html`, `pages/ai-automation-spectrum.html`, `pages/ai-governance.html`, `pages/ai-infrastructure-architecture.html`, `pages/ai-rpa-prioritization.html`, `pages/architecture.html`, `pages/assurance.html`, `pages/automation.html`, `pages/contact.html`, `pages/data-security.html`, `pages/document-processing.html`, `pages/executive-career-portfolio.html`, `pages/governance-integration.html`, `pages/greenfield-implementation.html`, `pages/operational-risk.html`, `pages/resources.html`, `pages/security-review.html`, `pages/solutions.html`, and `pages/vendor-assurance.html`

### Shared production assets

| Type | File | Audit note |
|---|---|---|
| Shared CSS | `assets/css/navigation.css` | Canonical theme, navigation, page layouts, section navigator, and responsive rules; approximately 122 KB and over 1,100 lines. It contains repeated overrides and many breakpoints, so later refactoring must be regression-tested. |
| Shared CSS | `assets/css/legacy-visuals.css` | Legacy content components; approximately 54 KB. Still required by most content pages. |
| Shared JavaScript | `assets/js/navigation.js` | Canonical default navigation, runtime-managed navigation replacement, desktop/mobile menus, nested disclosures, long-page section navigation, infographic controls, auth state, and copy-deterrence behaviour. |
| Shared JavaScript | `assets/js/resources.js` | Resource listing/download behaviour. |
| Shared JavaScript | `assets/js/auth.js` | Sign-in and registration behaviour. |
| Shared JavaScript | `assets/js/admin.js` | Administration interface behaviour. |

### Navigation and submenu implementation

`assets/js/navigation.js` is the central navigation source. It first injects a static fallback menu, then requests `/api/navigation` and replaces the menu when managed items are returned. It also:

- marks top-level groups active from route lists;
- opens menus by button click;
- closes menus on outside click, resize, or Escape;
- changes the mobile button's `aria-expanded` state and accessible label;
- supports nested in-page disclosure controls;
- builds an on-page section navigator for sufficiently long content pages.

The default Resources entry is currently a direct link, not a dropdown. Adding the glossary under Resources therefore requires coordinated changes to both the fallback navigation and the managed navigation data/source. The current menu supports Tab navigation and Escape dismissal, but it does not implement a complete arrow-key menu pattern or return focus to the dropdown trigger that opened a menu. These are enhancement candidates, not proof that the current menu is unusable.

### Embedded and page-specific code

- Embedded `<style>` blocks: `pages/ai-automation-spectrum.html`, `pages/assurance.html`, and `pages/executive-career-portfolio.html`
- Inline `style` attributes: concentrated on `pages/ai-automation-spectrum.html`
- Inline production `<script>` blocks: none detected
- Inline DOM event attribute: `pages/contact.html` calls `clearEmailError()` from `oninput`, but no definition was found
- Unique page scripts are otherwise routed through shared assets

The career portfolio may justify some unique presentation rules, but the automation-spectrum and assurance styles should be assessed for extraction into a shared component layer.

## Asset and theme consistency

Most content pages use:

- `legacy-visuals.css?v=20260719-63`
- `navigation.css?v=20260719-63`
- `navigation.js?v=20260719-63`

Exceptions:

- `index.html`: legacy CSS and navigation JS use `20260719-63`, while navigation CSS uses `20260724-home-mobile`
- `ai-automation-spectrum.html` and `assurance.html`: navigation CSS and JS use `20260723`
- `executive-career-portfolio.html`: shared assets have no query version
- `login.html`, `register.html`, and `admin.html`: shared assets have no query version

The production palette and typography are broadly shared. The principal visual-drift risks are the embedded styles, auth/admin pages using only part of the shared asset set, the career portfolio's unique styling, and the large sequence of later overrides in `navigation.css`. Do not introduce another design system; consolidate only after screenshot baselines exist.

## Static link and route findings

- No unresolved local HTML, CSS, JavaScript, image, download, or fragment targets were found in the 26-page production set.
- No duplicate IDs were found.
- No broken fragment anchors were found.
- Dynamic links embedded in `navigation.js` resolve to existing local pages, with `/login` and `/admin` relying on extensionless runtime routing.
- `login.html` and `register.html` reference `/api/auth/google`, which requires runtime validation.
- External URLs and mail/telephone links require a later network/runtime pass.
- There is no portal-local link-validation script. Phase 6 should add `scripts/validate-portal-links.*` using the parent project's JavaScript/Node.js toolchain.

## Content and terminology findings

### Density

Approximate visible-word counts identify the following outliers:

| Page | Approximate words | Finding |
|---|---:|---|
| `agentic-ai.html` | 4,965 | Critical density; many frameworks, control codes, matrices, standards, and operational details on one route |
| `ai-adoption.html` | 2,949 | High density; migration, cost, RACI, gates, and programme detail need a clearer decision path |
| `governance-integration.html` | 2,318 | High density; many standards are introduced in rapid succession |
| `ai-automation-spectrum.html` | 2,274 | High density; six operating tiers plus governance/regulatory material |
| `greenfield-implementation.html` | 1,620 | Dense implementation blueprint and artefact set |
| `security-review.html` | 1,440 | Detailed control questionnaire; needs an executive entry layer |
| `document-processing.html` | 1,344 | Strong subject matter but duplicates much of `solutions.html` |
| `solutions.html` | 1,350 | Substantial overlap with document-processing content |
| `ai-infrastructure-architecture.html` | 1,314 | Architecture-first language and many unexplained infrastructure abbreviations |
| `operational-risk.html` | 1,303 | Dense risk concepts and compact control language |
| `ai-governance.html` | 1,279 | Dense governance/control language |

No major content page contains an explicitly labelled “Executive summary” section. Some page introductions serve part of that purpose, but the intended business-first sequence is not consistently visible.

### Acronyms and first-use explanations

Likely unexplained or inconsistently expanded terms appear across the portal, including:

- AI/model: LLM, RAG, MCP, embeddings, vector stores, model drift, inference, fine-tuning, prompt injection
- Security/privacy: ABAC, RBAC, IAM, PAM, PII, DLP, SIEM, SOAR, HSM, VPC, ACL
- Architecture/operations: API, GPU, VRAM, DNS, SLA, TCO, STP, UAT, BCP, SDLC
- Governance/assurance: RACI, RMF, KPI, KRI, MRM, Three Lines, control plane, blast radius
- Standards/regulation: NIST, ISO/IEC, COBIT, COSO, DAMA-DMBOK, TOGAF, OSFI, APRA, GDPR, CCPA, PIPEDA, DORA, AIDA, EU AI Act
- Delivery/business: BFSI, BPM, CRM, ERP, RPA, ROI, SOW, SI, SME

Definitions are repeated in context, but there is no shared terminology source or stable glossary anchor. Later phases should preserve essential acronyms while expanding them at first use on every page and linking only the first meaningful use of important terms.

### Coverage gaps

There is no central glossary page. Several requested high-priority subjects exist only as sections within broader pages rather than as dedicated routes: Retrieval-Augmented Generation, vector databases, model runtime, skills, Model Context Protocol, evaluation, guardrails, production readiness, and repository architecture. Agents and multi-agent systems are covered extensively within the agentic and automation-spectrum pages.

Do not create or split these routes automatically. First map search intent, navigation load, duplication, and compatibility requirements. A split is most justified for `agentic-ai.html`; other dense pages may be improved through summaries, progressive disclosure, and stronger in-page navigation without route changes.

## Accessibility and responsive findings

Positive static findings:

- All inspected production images have `alt` attributes.
- All production content pages use a `<main>` landmark.
- Most content pages include a skip link.
- No duplicate IDs were detected.
- Shared navigation buttons expose `aria-expanded`; the mobile button has `aria-controls` on standard content pages.
- Reduced-motion rules exist in shared CSS.

Issues requiring remediation or browser confirmation:

- `index.html` has no `<h1>`; its visible lead heading is an `<h3>`.
- `ai-automation-spectrum.html` has two heading-level jumps; `contact.html` has one.
- `admin.html`, `login.html`, and `register.html` do not include skip links.
- `admin.html`, `login.html`, and `register.html` have no meta description.
- `ai-automation-spectrum.html` has no meta description.
- Contact form labels do not use `for` attributes or wrap their controls.
- The contact form's validation hook is undefined, and the “Send Message” button has no statically identified submission handler.
- Visible mojibake affects icons, arrows, ellipses, and descriptive text on at least `ai-adoption.html`, `ai-governance.html`, `contact.html`, `data-security.html`, `operational-risk.html`, `security-review.html`, and `vendor-assurance.html`; a corrupted minus symbol also appears in `navigation.js`.
- The architecture infographic supports wheel zoom and pointer drag, but full keyboard-equivalent pan/zoom and screen-reader instructions need browser inspection.
- The shared CSS contains many overlapping responsive breakpoints. Static inspection cannot establish whether tables, matrices, long labels, navigation, or infographics overflow at 320–430 px widths.
- Mobile menus close on outside click and Escape, but focus order, focus return, scroll locking, touch target sizing, and managed-navigation timing need interactive testing.

## Duplicate, backup, test, temporary, and generated material

These files are proposed for reference checking in Phase 6. Nothing was removed.

| Candidate | Evidence | Proposed action after reference/deployment checks |
|---|---|---|
| `pages/solutions_test.html` | Byte-for-byte duplicate of `pages/solutions.html` | Remove if no runtime/admin reference exists |
| `index.html.bak` | Backup file | Remove from deployable source after confirming no recovery need |
| `pages/ai-automation-spectrum.html.bak` | Backup file | Remove from deployable source after diff/recovery review |
| `temp_body.html` | Temporary standalone content | Archive or remove after provenance check |
| `withHero.html`, `withStyle.html` | Empty HTML files | Remove after reference check |
| `work/deploy-package-20260719-63/` | Generated deployment copy | Exclude/archive after confirming it is not a deployment input |
| `work/deploy-package-20260719-63-clean/` | Duplicate generated deployment copy | Exclude/archive after confirming it is not a deployment input |
| `work/*_content.html` | Intermediate content fragments | Archive or remove after build-script review |
| `work/artifacts/`, `work/greenfield_artifacts/`, `work/raci_metrics_artifacts/` | Generated previews and inspection output | Keep outside production publishing; add ignore rules only after scope review |
| `.local-server-8081.pid`, `.wrangler/` | Local runtime state | Exclude from source control/deploy packages |
| `index_files/` | Saved-page assets and `.download` material | Remove only after checking current references and provenance |

The two deploy-package directories contain identical copies of many pages and assets, but those copies are older working outputs and must not replace current production files.

## Page-by-page prioritised remediation plan

Priority definitions: **P0** broken or user-visible production defect; **P1** high business/readability or governance risk; **P2** important consistency/quality work; **P3** light editorial or verification work.

| Page | Priority | Audit finding and proposed remediation |
|---|---|---|
| `index.html` | P0 | Add a single meaningful `<h1>` without changing the home visual hierarchy; expand HITL, IAM, PAM, RBAC, and ROI at first use; align cache versions. |
| `pages/contact.html` | P0 | Repair character encoding, bind labels to controls, replace/remove undefined inline validation, implement and test the intended submit behaviour, and correct heading order. |
| `pages/agentic-ai.html` | P1 | Highest-density page. Add purpose and executive summary; explain agent, tool, skill, LLM, MCP, RAG, HITL, blast radius, and control terms before matrices; separate board decisions from implementation evidence. Evaluate a split into overview, architecture patterns, control framework, and operational assurance while preserving the existing URL as the overview/compatibility route. |
| `pages/ai-adoption.html` | P1 | Add an executive decision path; explain migration assumptions, TCO, ROI, RACI, UAT, SOW, and platform terms; reduce repeated gate language; repair mojibake. |
| `pages/governance-integration.html` | P1 | Start with the business purpose of framework integration; group standards by the problem they solve; expand each standard at first use; distinguish requirements, guidance, controls, and evidence; reduce checklist density. |
| `pages/ai-automation-spectrum.html` | P1 | Add a business-facing tier-selection summary; clarify the boundary between RPA, assistants, skills, tool-using agents, and multi-agent systems; extract reusable embedded CSS; add meta description; repair heading hierarchy and asset versions. |
| `pages/ai-infrastructure-architecture.html` | P1 | Add an executive architecture summary and decision guidance; explain gateway, model endpoint, RAG, GPU/VRAM, HSM, DLP, SIEM/SOAR, ABAC/RBAC, and egress controls; test infographic responsiveness and keyboard alternatives. |
| `pages/greenfield-implementation.html` | P1 | Lead with outcomes, prerequisites, ownership, cost/time expectations, and stage gates; explain framework and file-format abbreviations; preserve the detailed artefact blueprint beneath the summary. |
| `pages/security-review.html` | P1 | Add a concise decision summary and use/ownership guidance before the questionnaire; expand security acronyms; distinguish blockers from remediable findings; repair mojibake; preserve control depth. |
| `pages/operational-risk.html` | P1 | Explain action authority, containment, drift, and human oversight in business terms; expand AML, LLM, API, ROI, BFSI, and other abbreviations; repair mojibake. |
| `pages/data-security.html` | P1 | Explain data-flow and privacy outcomes before gateway/tokenisation detail; expand RBAC, API, LLM, GPU, VPC, and IP; repair mojibake and validate claims about identity stripping and vendor exposure. |
| `pages/ai-architecture.html` | P1 | Clarify the distinction between this runtime/control-plane page and infrastructure architecture; explain deny-by-default, control plane, RAG, re-embedding, ACL, GPU, HITL, IAM, RBAC, and regulated-data terms; add when-to-use guidance. |
| `pages/document-processing.html` | P1 | Reframe around business process outcomes and exception handling; expand OCR, STP, QA, SME, ROI, PO, and vendor terms; reconcile major overlap with `solutions.html`. |
| `pages/vendor-assurance.html` | P1 | Add procurement and risk decision guidance; expand BYOM, SLA, TCO, API, GPU, CRM, and GDPR; repair mojibake; make portability and exit controls explicit. |
| `pages/ai-governance.html` | P1 | Add an executive summary and operating-model explanation; expand AIDA, CDO, CISO, CRO, OSFI, GDPR, and PIPEDA; repair mojibake; distinguish policy, oversight, inventory, and evidence. |
| `pages/assurance.html` | P2 | Explain assurance outcomes, Three Lines, KPI/KRI, opinions, gates, and evidence in plain language; assess embedded CSS for extraction; align asset versions. |
| `pages/solutions.html` | P2 | Clarify the portfolio purpose and intended audience; remove or consolidate duplicated document-processing content; mark genuinely unavailable offerings precisely rather than with a broad “Coming Soon” label. |
| `pages/ai-rpa-prioritization.html` | P2 | Expand RPA, TCO, API, and platform/vendor abbreviations; explain scoring and evidence expectations; add risks, exclusions, and decision ownership. |
| `pages/architecture.html` | P2 | Expand the short overview into a useful business routing page; explain API, HITL, and PII; link clearly to architecture, infrastructure, security, and governance detail. |
| `pages/automation.html` | P2 | Replace the 58-word “Coming Soon” stub with a purposeful routing/overview page or remove it from primary navigation only after a route decision; avoid duplicating the automation-spectrum page. |
| `pages/resources.html` | P2 | Add the glossary entry point; expand resource abbreviations; organise resources by audience/use; ensure runtime and fallback navigation agree. |
| `pages/executive-career-portfolio.html` | P2 | Confirm whether its unique embedded theme is an intentional exception; expand BFSI and CAD; align cache versions; retain the distinct editorial presentation if approved. |
| `pages/about.html` | P3 | Expand BFSI, IAM, and PAM; add clearer relevance to the portal's advisory focus; keep concise. |
| `admin.html` | P3 | Add meta description and skip link; verify admin navigation, focus management, form labels, errors, and mobile layout at runtime. Do not alter authentication or API behaviour in the content phase. |
| `login.html` | P3 | Add meta description and skip link; runtime-test Google auth, validation, error focus, and mobile layout. |
| `register.html` | P3 | Add meta description and skip link; runtime-test registration, Google auth, validation, error focus, and mobile layout. |

## Proposed phased plan

### Phase 2 — shared theme, navigation, and asset consistency

Planned files: `assets/css/navigation.css`, `assets/css/legacy-visuals.css`, `assets/js/navigation.js`, embedded-style pages, and HTML asset references.

Intended result: one documented cache version, smaller page-specific CSS, aligned fallback/runtime navigation behaviour, repaired encoding, and preserved desktop/mobile/submenu behaviour. Before edits, capture representative desktop and mobile screenshots and define a rollback commit.

### Phase 3 — glossary and terminology standard

Planned files: `docs/plain-language-writing-standard.md`, `pages/ai-technology-glossary.html`, Resources navigation/menu data, and limited first-use glossary links.

Intended result: an A–Z, filterable, categorised glossary with stable anchors and page links; an enforceable first-use expansion standard; no distracting over-linking.

### Phase 4 — high-priority content

Planned first group: `agentic-ai.html`, `ai-adoption.html`, `governance-integration.html`, `ai-automation-spectrum.html`, `ai-infrastructure-architecture.html`, `greenfield-implementation.html`, `security-review.html`, `operational-risk.html`, `data-security.html`, `ai-architecture.html`, `document-processing.html`, and `vendor-assurance.html`.

Intended result: business meaning and decision guidance first, technical implementation and controls retained in later layers. Treat route splits as separate, reviewed changes with compatibility routes.

### Phase 5 — remaining content

Planned files: remaining content pages, including short routing pages, assurance, governance, resources, profile, and auth/admin copy where appropriate.

Intended result: consistent terminology, summaries, metadata, headings, cross-links, and audience-specific guidance without flattening technical depth.

### Phase 6 — validation, accessibility, responsive behaviour, and cleanup

Planned files: a new Node.js link validator under `scripts/`, targeted fixes, and only approved cleanup candidates.

Intended result: automated local link/fragment/asset/duplicate-ID checks; browser checks at representative desktop, tablet, and mobile widths; keyboard and focus validation; external/runtime checks; confirmed cleanup with deployment references reviewed.

### Phase 7 — final change report

Planned file: `docs/change-summary.md`.

Intended result: exact files added/modified, pages rewritten/split, glossary totals, theme/navigation changes, validation and test evidence, removals, remaining risks, and recommended next actions.

## Phase gates and recommended next actions

Before Phase 2:

1. Confirm the 26-page production scope and whether admin/auth routes are included in the content standard.
2. Decide how to record the untracked portal baseline without absorbing unrelated parent-repository work.
3. Capture browser screenshots for home, a typical concept page, `agentic-ai.html`, `ai-automation-spectrum.html`, `assurance.html`, the career portfolio, Resources, contact, login, and admin.
4. Confirm whether `/api/navigation` data is authoritative in production and how menu changes are seeded.
5. Choose one cache-busting value or deployment-generated strategy.
6. Fix P0 defects and mojibake as a small, reviewable commit before broader content work.

After each later phase, run the new static validator, the parent project's supported check, targeted browser tests, and a secret/local-path scan. Do not delete candidates or split routes until references and deployment behaviour have been confirmed.
