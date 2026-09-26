# 0.16 URL and redirect plan

## Pattern

- `/transformation` — overview
- `/transformation/stage-{n}-{stage-slug}` — stage overview
- `/transformation/stage-{n}-{stage-slug}/{page-slug}` — stage guidance
- `/knowledge-centre/{concept-slug}` — canonical reusable knowledge
- `/deliverables/{deliverable-slug}` — deliverable record
- `/templates/{template-slug}` — template description and controlled attachment
- `/tools/{tool-slug}` — interactive or downloadable tool

Keep URLs short, lowercase, hyphenated and free of file extensions. Stage numbers make lifecycle sequence explicit.

## Redirect policy

No redirect is implemented in Phase 0. After approval:

1. Destination must exist, be reviewed and be published.
2. Preserve query strings and relevant fragments.
3. Use permanent redirects only after content acceptance.
4. Prevent chains and loops.
5. Keep an auditable redirect register.
6. Test inbound links, analytics and search indexing.
7. Roll back by removing the redirect mapping, not by deleting content.

The planned register is [route-redirect-register.csv](data/route-redirect-register.csv).

