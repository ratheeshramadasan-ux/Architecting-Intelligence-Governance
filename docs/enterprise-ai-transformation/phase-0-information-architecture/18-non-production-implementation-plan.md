# 0.17 Non-production implementation plan

1. Obtain Platform Owner Phase 0 approval.
2. Freeze the approved taxonomy, stage IDs and migration matrix version.
3. Create a dedicated `codex/phase-1-methodology-navigation` branch or isolated worktree.
4. Add methodology metadata and validation without changing public routes.
5. Build reusable stage, article, deliverable, RACI, gate and checklist components.
6. Seed the proposed menu in a separate D1 preview database.
7. Create stage overviews only where minimum content and gate structures are reviewable.
8. Migrate one vertical slice—Stage 0—as the pilot.
9. Validate accessibility, mobile behavior, internal links, access controls and performance.
10. Review the prototype with methodology, content, UX, technical and QA owners.
11. Expand stage by stage; maintain dual-route compatibility.
12. Prepare redirects only when destinations are accepted.
13. Rehearse database and asset rollback.
14. Request separate production-change approval.

## Rollback

Retain current static pages and navigation seed; version all D1 migrations; export preview metadata; make route maps additive; never delete a current route in the migration release. Rollback restores the previous Worker version and menu snapshot.

## Production boundary

Phase 0 changes only documentation and generated analysis data. No Cloudflare deployment, remote D1 migration, production variable change, DNS change, public-menu replacement or redirect was performed.

