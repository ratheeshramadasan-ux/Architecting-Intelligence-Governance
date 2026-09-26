# ADR: Navigation source of truth

- Status: Proposed for Phase 1 review
- Date: 2026-08-02
- Scope: architecture decision only; no consolidation implemented

## Context

Navigation is currently represented by `greenfield-portal/assets/data/methodology.json`, D1 `menu_items`, `/api/navigation`, `methodology-v10.js`, `navigation.js`, and the Worker's `STATIC_CONTENT_PAGES`. The current public methodology shell renders JSON directly. The legacy renderer also reads the JSON. D1 remains administrable but is not the effective public-navigation authority. `STATIC_CONTENT_PAGES` is a page/access catalogue, not a complete route map.

## Options

| Criterion | A — static JSON | B — D1 authority | C — versioned baseline plus D1 published document |
|---|---|---|---|
| Reliability/resilience | Strong; deploy-contained fallback | Depends on D1 availability and data integrity | Strong; D1 primary with deploy-contained fallback |
| Admin editability | None without a code change | Strong | Strong through controlled publish workflow |
| Version control/rollback | Native Git history | Requires explicit version tables and export | Git baseline plus D1 publication/version rollback |
| Validation | Simple pre-deploy schema checks | Requires runtime/database validation | One schema validates both representations |
| Offline/local development | Excellent | Requires migrated/seeded D1 | Excellent fallback plus realistic local D1 path |
| Deployment complexity | Lowest | Moderate | Moderate, with a normalizer and publish workflow |
| Security | Small mutation surface | Admin/API mutation must be tightly authorized | Same D1 controls, with a safe immutable fallback |
| Performance/cacheability | Static/CDN-friendly | Requires API fetch/cache policy | Published document can be cached; fallback is static |
| Schema evolution | Code and JSON migrate together | Requires database migrations | Explicit shared schema version and adapters |
| Drift/recovery risk | Admin and code needs can diverge | Database can diverge from code | Lowest if publish validates the same canonical schema |

## Decision

Adopt Option C in Phase 1, subject to implementation review:

```text
version-controlled canonical navigation schema and approved fallback
    + D1 published navigation document using the same schema/version
    → one normalizer
    → one shared renderer
    → desktop, mobile, active state, breadcrumbs, and footer context
```

The version-controlled document is the recovery baseline. A valid published D1 document may override it at runtime. Invalid, absent, or unavailable D1 content must fall back without producing an empty header.

## Reconciliation responsibilities

- `methodology.json`: retain transformation methodology; extract or reference the canonical navigation document without duplicating labels/routes.
- D1 `menu_items`: treat as legacy relational input until a future additive migration introduces versioned navigation documents or a deterministic adapter.
- `/api/navigation`: return the canonical normalized schema, schema version, publication version, and fallback status.
- `methodology-v10.js` and `navigation.js`: converge on one renderer; legacy code becomes a compatibility bootstrap only.
- `STATIC_CONTENT_PAGES`: retain only page/access catalogue responsibilities; do not use it to define menu hierarchy.
- Validators: validate schema, unique stable IDs, route resolution, fallback parity, publication compatibility, active-state rules, and the required `/lifecycle/` destination.

## Consequences and guardrails

- Admin edits require validation and an explicit publish action.
- Publishing creates a recoverable immutable version.
- The renderer must not execute arbitrary HTML from navigation records.
- URLs remain allow-listed to local absolute paths or approved HTTPS destinations.
- Phase 1 must preserve existing routes and both current shells until compatibility validation passes.

