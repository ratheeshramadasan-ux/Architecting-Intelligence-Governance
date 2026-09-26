# Pre-Phase 1 validator alignment

## Current-contract validators

- `validate-portal-links.mjs` checks production HTML targets, duplicate IDs, H1s, and image alternatives.
- `validate-shared-shell.mjs` checks the recovered shared-shell contract.
- Assessment, readiness, lifecycle, syntax, and encoding validators represent current implemented structures.
- `validate-live.mjs` now follows the same production-page boundary as the static portal validator by excluding explicitly named `_test` and `.bak` files.

## Historical expectation corrected

`validate-methodology.mjs` still expected a seven-item menu labelled `Lifecycle` pointing to `/journey/`. The accepted production structure contains eight items, separates Standards, labels the individual delivery path `AI Solution Lifecycle`, and points it to `/lifecycle/`. `/journey/` is a guided entry experience, not the dedicated individual solution lifecycle.

The validator was updated to enforce the current accepted contract without weakening any checks. The fourteen-stage enterprise transformation sequence, status, numbering, evidence, deliverable, RACI, and route checks remain unchanged.

## Intentionally deferred

Navigation schema/fallback parity, D1 publication validation, and renderer convergence are Phase 1 responsibilities described in the navigation ADR. They are not simulated by weakening current static checks.
