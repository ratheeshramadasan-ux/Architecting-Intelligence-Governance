# FP-1 Validation Report

Date: 2026-07-28

## Automated validation

- JavaScript syntax: `src/worker.js` passed.
- JavaScript syntax: `assets/js/admin.js` passed.
- Portal validation: 188 production HTML pages passed.
- Broken local targets: none.
- Duplicate IDs: none.
- Missing H1 headings: none.
- Missing image alternative text: none.
- Methodology, assessment, readiness and search integration suites: passed.
- D1 migrations `0008` and `0009`: applied successfully to the local database.

## Authenticated functional validation

An isolated local Worker and local-only administrator account were used.

| Test | Result |
|---|---|
| Protected `/admin` route | Passed |
| Administration shell | 18 modules / 19 panels |
| Browser console errors | None |
| Page catalogue | 25 routes |
| Access roles loaded | 4 |
| Versioned page creation | Passed; local page ID 1 |
| Page soft-delete and retention | Passed; archived locally with one immutable revision retained |
| Workflow transition | Passed; draft → in review |
| Version history query | Passed; one immutable revision |
| Search inventory rebuild | Passed; 8 records |
| Governed authoring brief | Passed; human-review marker present |
| Mobile admin overflow at 390px | Passed; scroll width equals viewport |
| Mobile sidebar behavior | Passed; sidebar becomes in-flow/static |
| Shared footer desktop (1440px) | Passed; present, normal flow, cream background retained, no horizontal overflow |
| Shared footer tablet (768px) | Passed; present, normal flow, cream background retained, no horizontal overflow |
| Shared footer mobile (390px) | Passed; present, normal flow, cream background retained, no horizontal overflow |

## Cloudflare validation

`npm run check` passed against Wrangler 4.114.0. FP-1 does not authorise or perform a production deployment.

## Screenshots

- `docs/fp1-screenshots/admin-dashboard.png`
- `docs/fp1-screenshots/admin-page-management.png`
- `docs/fp1-screenshots/admin-rich-page-editor.png`
- `docs/fp1-screenshots/admin-workflow-approvals.png`
- `docs/fp1-screenshots/admin-mobile.png`
- `docs/fp1-screenshots/shared-footer-desktop.png`
