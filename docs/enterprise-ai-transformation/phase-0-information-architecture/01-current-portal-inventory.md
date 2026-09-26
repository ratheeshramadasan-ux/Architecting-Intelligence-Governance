# 0.1 Current portal inventory

Generated from the non-production repository by `scripts/build-phase0-inventory.mjs`.

## Scope and findings

- 28 current application and content pages were inventoried.
- 8 downloadable artifacts and 8 visual assets were inventoried.
- Backup, work, deployment-package, temporary and test files are excluded from current-route totals and recorded as repository hygiene findings.
- Navigation is database-managed through `menu_items`; page access is managed through `page_access`; the Worker also maintains a static page catalogue.
- No calculator route was found. Spreadsheet-based scoring and prioritisation tools exist as downloads.

## Current route catalogue

| Current route | Current heading | Type | Proposed action | Future area |
|---|---|---|---|---|
| `/` | Welcome to Architecting Intelligence | landing | retain | Home |
| `/admin.html` | Portal administration | application | retain | Utility |
| `/login.html` | Welcome back | application | retain | Utility |
| `/register.html` | Create your account | application | retain | Utility |
| `/pages/about.html` | About Me | guidance | move | Knowledge Centre |
| `/pages/agentic-ai.html` | Agentic AI Governance Framework | guidance | split | Stage 4 — Establish Governance |
| `/pages/ai-adoption.html` | The Enterprise Tool Migration Trap | guidance | split | Stage 3 — Define Strategy |
| `/pages/ai-architecture.html` | AI Architecture & Implementation Framework | guidance | split | Stage 7 — Design the Target Architecture |
| `/pages/ai-automation-spectrum.html` | Enterprise AI Automation Spectrum | guidance | move | Knowledge Centre |
| `/pages/ai-governance.html` | Governance, Compliance & Oversight | guidance | merge | Stage 4 — Establish Governance |
| `/pages/ai-infrastructure-architecture.html` | AI Infrastructure Architecture | guidance | split | Stage 7 — Design the Target Architecture |
| `/pages/ai-rpa-prioritization.html` | AI & RPA Opportunity Prioritization | guidance | move | Stage 5 — Identify and Prioritise Opportunities |
| `/pages/ai-technology-glossary.html` | AI & Technology Glossary | guidance | retain | Knowledge Centre |
| `/pages/architecture.html` | Enterprise Architecture & Implementation | guidance | merge | Stage 7 — Design the Target Architecture |
| `/pages/assurance.html` | Enterprise AI Assurance | guidance | merge | Stage 12 — Operate and Govern Production |
| `/pages/automation.html` | Automation Framework | guidance | move | Knowledge Centre |
| `/pages/contact.html` | Get in Touch | guidance | retain | Utility |
| `/pages/data-security.html` | Data Security & Privacy | guidance | split | Stage 7 — Design the Target Architecture |
| `/pages/document-processing.html` | The Document Processing Misconception | guidance | move | Knowledge Centre |
| `/pages/executive-career-portfolio.html` | From financial discipline to governed AI transformation. | guidance | archive | About |
| `/pages/governance-integration.html` | Governance Integration Model | guidance | merge | Stage 4 — Establish Governance |
| `/pages/greenfield-implementation.html` | Greenfield AI Governance Implementation Blueprint | guidance | split | Stage 8 — Plan Implementation |
| `/pages/knowledge-discovery.html` | Knowledge Discovery | guidance | retain | Knowledge Centre |
| `/pages/operational-risk.html` | Operational & Behavioural Risk | guidance | move | Stage 12 — Operate and Govern Production |
| `/pages/resources.html` | Resources & Downloads | guidance | move | Deliverables |
| `/pages/security-review.html` | Enterprise AI Security & Architecture Review | guidance | merge | Stage 7 — Design the Target Architecture |
| `/pages/solutions.html` | Enterprise AI & Automation Solutions | guidance | split | Stage 5 — Identify and Prioritise Opportunities |
| `/pages/vendor-assurance.html` | Vendor, Infrastructure & Lifecycle Dependencies | guidance | move | Stage 4 — Establish Governance |

## Supporting inventories

- [Current content inventory](data/current-content-inventory.csv)
- [Downloads](data/download-inventory.csv)
- [Visual assets](data/visual-asset-inventory.csv)
- [Machine-readable summary](data/inventory-summary.json)

## Repository findings

The deployable portal contains 28 routes, but the repository also contains a full backup tree, generated deployment packages, temporary HTML fragments, office lock files and test pages. These must not be interpreted as published methodology content. They should be cleaned only through a separately approved repository-hygiene change.

## Current database-managed navigation

The current local migration state contains these top-level items: Knowledge Discovery; AI Strategy & Adoption; AI Governance; AI Architecture; AI Implementation; AI Solutions (hidden); Intelligent Automation; Security & Risk; and Resources. Home and Contact are fixed navigation items. Child items resolve to the guidance routes included in the route catalogue above.

This current navigation is evidence for the migration analysis only. Phase 0 does not replace it.
