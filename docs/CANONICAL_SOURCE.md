# Canonical Portal Source

This repository previously accumulated multiple long-lived feature and rollout branches. To avoid deploying from an obsolete portal baseline, `canonical-portal-consolidation` is the recovery branch that combines the newest coherent portal baseline with the RR Bank governed AI banking demo and its runtime source.

## Canonical baseline

Portal baseline: `feature-ai-infrastructure-architecture`

Why: this branch contains the newer reorganized portal structure (AI Journey, Governance, Capabilities, Architecture), the updated homepage, AI Infrastructure Architecture, Greenfield AI Adoption, AI Classification & Assurance, governance/capability libraries, and the newer static-content organization.

## RR Bank source included

Imported from `rr-bank-runtime-e2e` without replacing the newer portal baseline:

- `enterprise-architecture/banking-agent-demo/`
- `pages/ai-architecture/banking-agent-demo/`
- `runtime/rr-bank/`
- `.github/workflows/rr-bank-runtime-ci.yml`

The RR Bank source includes the professional banking UI, live execution-flow visualization, configurable governed model selector, FastAPI runtime, Google ADK integration, MCP tools, authorization/non-enumeration controls, HITL credit-limit workflow, runtime tests and deployment source.

## Branch preservation

Existing branches remain in Git history as recovery/archive sources. They should not be used as production deployment baselines unless explicitly reviewed. Important historical branches include:

- `backup-main-2026-07-18-before-rollback`
- `feature/ai-implementation-section`
- `feature/clean-static-rebuild`
- `feature/greenfield-ai-adoption`
- `feature/preserve-content-reorganize-menu`
- `feature/restore-complete-library`
- `feature/standard-global-navigation`
- `feature-ai-infrastructure-architecture`
- `greenfield-ai-governance-redesign`
- `rollout/greenfield-review`
- `rollout/greenfield-review-copy`
- `rollout/greenfield-review-final`
- `rr-bank-agent-demo`
- `rr-bank-live-runtime`
- `rr-bank-runtime-e2e`
- `main`

## Going-forward rule

1. `canonical-portal-consolidation` is the integration/recovery source until production validation is complete.
2. Validate the Cloudflare branch preview before touching `main`.
3. Once validated, merge the canonical branch into `main` and treat `main` as the only production source of truth.
4. New work must branch from the current `main`, not from historical feature branches.
5. Short-lived feature branches should be merged through pull requests and then archived/deleted after release.
6. Cloudflare production must deploy only from `main`.
7. The RR Bank backend runtime remains under `runtime/rr-bank`; hosting configuration can evolve independently (for example Cloud Run) without changing the portal source-of-truth rule.

## Current consolidation commit

The consolidation commit imports RR Bank files by Git blob SHA into the newer portal tree, so newer portal pages are preserved rather than overwritten by the older `main` homepage.
