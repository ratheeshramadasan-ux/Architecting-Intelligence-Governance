# ADR: Theme and design-token source of truth

- Status: Proposed for Phase 1 review
- Date: 2026-08-02
- Scope: architecture decision only; no broad CSS consolidation implemented

## Context

Theme authority is split across the Worker's `APPROVED_THEME`, D1 `theme_versions`, `/api/theme`, `navigation.css`, `methodology-v10.css`, `ux1-visual-system.css`, `shared-site-shell.css`, component/page CSS, and inline styles. D1 already supports draft/published/superseded versions, but multiple CSS systems define overlapping global behavior.

## Decision

Use one approved design-token schema:

```text
version-controlled approved token schema and fallback
    + D1 published values for explicitly administrable tokens
    → validation and contrast checks
    → one CSS-variable token output
    → shared shell CSS
    → explicit legacy compatibility layer
    → page/component CSS
```

The Worker fallback remains available until it can be generated from the same version-controlled token document. D1 may override only fields declared administrable by the schema. Invalid or inaccessible D1 data falls back atomically; partial unvalidated themes must not leak into rendering.

## Token ownership

| Concern | Future authority |
|---|---|
| Brand and neutral colours | Canonical token schema; approved D1 overrides where authorized |
| Success, warning, risk, critical, informational states | Canonical semantic tokens, not page-local colours |
| Typography and type scale | Canonical font-family, size, weight, and line-height tokens |
| Spacing and content widths | Canonical layout tokens |
| Header dimensions and navigation layout | Shared shell component CSS consuming tokens |
| Breakpoints | Version-controlled CSS/build constants; not freely admin-editable |
| Motion | Canonical duration/easing tokens plus mandatory reduced-motion rules |
| Borders, radii, and shadows | Canonical surface tokens |
| Component-specific styling | Component CSS using canonical tokens |
| Legacy pages | Explicit compatibility stylesheet with a documented retirement map |
| Inline styles | Allowed only for data-driven values that cannot be represented by a component modifier; otherwise migrate gradually |

## Current-authority reconciliation

- `APPROVED_THEME`: temporary runtime fallback; align with the canonical schema rather than editing independently.
- `theme_versions` and `/api/theme`: retain publish/version semantics and emit validated canonical CSS variables.
- `navigation.css` and `methodology-v10.css`: stop owning competing global token values in Phase 1; consume the shared output incrementally.
- `ux1-visual-system.css`: treat as a pilot/reference until its reusable components are accepted into the shared system.
- `shared-site-shell.css`: become the owner of global viewport, shell, header/footer, focus, and content-frame behavior.
- Page CSS and inline styles: preserve during stabilization; inventory and migrate route families later.

## Guardrails

- No theme publication may weaken required contrast or visible focus.
- Breakpoints, reduced-motion behavior, and security-sensitive asset URLs are code-governed.
- Theme values are data, never executable CSS fragments or HTML.
- Publishing and rollback remain auditable.
- Legacy compatibility must be explicit and removable; it must not become a second permanent design system.

