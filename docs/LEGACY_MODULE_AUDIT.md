# Legacy Module Audit

This audit compares the canonical portal consolidation branch against the major historical portal branches and the exact pre-reorganization portal source.

## Exact historical source

The historical rich portal at commit `86b09e0ee7c3fd9bb78236b91ad6f8c3a56b8ce2` used blob `4be2ceac8975d437c090815158cb2c850595d9d8` for `index.html`.

That exact blob is preserved verbatim in the canonical branch as:

`content/governance-library-content.html`

Therefore the original detailed portal content was not deleted; it was preserved and wrapped by the newer information architecture.

## Historical modules verified as preserved

- Governance & Compliance → `governance-library.html#gov`
- Operational & Behavioural Risk → `governance-library.html#ops`
- Data Security & Privacy → `governance-library.html#data`
- Vendor & Infrastructure Risk → `governance-library.html#vendor`
- Security Review Framework → `governance-library.html#review`
- Agentic AI Framework → `governance-library.html#agentic`
- Document Understanding / Document Processing → `governance-library.html#docproc`
- Automation Architecture → `governance-library.html#automation`
- Resources & Downloads → `governance-library.html#resources`

## Historical branches compared

- `backup-main-2026-07-18-before-rollback` — ancestor of the canonical branch; no unique module files missing.
- `feature/restore-complete-library` — ancestor; no unique module files missing.
- `greenfield-ai-governance-redesign` — ancestor; no unique module files missing.
- `rollout/greenfield-review-final` — ancestor; no unique module files missing.
- `feature/standard-global-navigation` — primarily reorganized wrappers/navigation; canonical branch already contains the preserved content files used by that approach.
- `feature/preserve-content-reorganize-menu` — Greenfield client deck and infographic are already present in the canonical portal baseline.
- `feature/clean-static-rebuild` — contained recovery/static-shell files rather than unique governance modules. These legacy shell assets are archived under `archive/legacy-static/` for source preservation.
- `rr-bank-runtime-e2e` — contains the RR Bank UI/runtime source; this source is imported into the canonical branch as part of consolidation.

## Source-of-truth rule

After visual validation and production cutover, `main` should be the only production source of truth. Historical branches are retained for audit/recovery only and should not be deployed directly.

Any future feature branch must start from the latest `main`.
