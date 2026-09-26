# Visual Experience hero audit

## Logo context mapping

| Context | Repository asset | Rule |
| --- | --- | --- |
| Homepage and dark cinematic shell | `/assets/images/ratheesh-technology-logo-dark-header.png` | Complete supplied dark-background lock-up; intrinsic 2172 × 724 ratio; `object-fit: contain` |
| Dark or mixed interior header | `/assets/images/ratheesh-technology-logo-transparent.png` | Complete transparent lock-up; intrinsic 1906 × 825 ratio; `object-fit: contain` |
| Light background | `/assets/images/ratheesh-technology-logo.png` | Complete light-context lock-up; intrinsic 1906 × 825 ratio; `object-fit: contain` |

The shared header selects the homepage asset only for `/` and `/index.html`. Interior pages retain the transparent asset. No logo is recreated, separated, recoloured, cropped or stretched.

## Shared hero architecture

The central implementation is `/assets/css/portal-hero-system.css`:

- H1 `portal-hero--home`: 330–400px desktop target; homepage only.
- H2 `portal-hero--section`: 220–280px desktop target; major domains.
- H3 `portal-hero--page`: 140–190px desktop target; detailed and utility pages.
- Mobile heights are content-driven.

Future CMS mapping can use `hero_variant`, `hero_visual`, `hero_eyebrow`, `hero_title`, `hero_description`, `hero_alt_text`, and `hero_focal_position`. No schema migration is required for this pilot.

## Route classification

| Route | Previous treatment | Proposed / applied | Reason |
| --- | --- | --- | --- |
| `/` | Bespoke 300px cinematic hero | H1, 350px | Sole rich portal-level proposition |
| `/pages/ai-governance.html` | Legacy article hero; variable height | H2 | Major governance domain |
| `/pages/ai-architecture.html` | Legacy article hero; variable height | H2 | Major architecture domain |
| `/pages/agentic-ai.html` | Legacy article hero; variable height | H2 | Major agentic-systems domain |
| `/case-studies/` | Bespoke collection hero | H2 | Top-level evidence domain |
| `/case-studies/#agentic-commission-operations` | Collection anchor/card | Specialized evidence presentation | Stable anchor retained; no duplicate detail route invented |
| `/pages/executive-career-portfolio.html` | Oversized 86px padding and up to 6rem title | H3 | Detailed profile; evidence moved into compact strip |
| `/pages/about.html` | Detail hero | H3 | Orientation page |
| `/pages/contact.html` | Legacy article hero | H3 | Utility page |

## Remaining portal inventory

A repository scan finds 41 HTML routes with hero or masthead patterns. The pilot above covers all explicitly requested routes that currently exist. Remaining major-domain pages should progressively adopt H2; methodology detail pages, resources, reports, standards, templates and tools should adopt H3; dashboards and task-oriented utilities may use No Hero. This avoids a risky bulk rewrite of approximately 199 pages.

Worst remaining inconsistencies should be addressed in this order:

1. Pages with embedded inline hero sizing.
2. Legacy `platform-page-hero` pages with large padding.
3. Methodology pages whose hero includes duplicate breadcrumb/context blocks.
4. Utility pages where substantive content begins below decorative mastheads.

## People and leadership CMS note

The supplied consolidated instruction file ends mid-sentence before its detailed People/Leadership requirements. The current schema has no central people-profile content model. Adding it safely requires an additive table, RBAC-protected Admin CRUD, public read API, migration reconciliation and tests. That work is intentionally not inferred from the truncated text; exact profile fields and publication behavior must be recovered from the missing remainder before schema work.
