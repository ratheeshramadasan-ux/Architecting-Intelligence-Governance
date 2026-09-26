# Recovery Audit 04 — Functional Parity Inventory

## Finding

Administration and CMS capabilities have not been deleted from the current working tree. They are present in `greenfield-portal/admin.html`, `assets/js/admin.js`, `src/worker.js`, and additive migrations. They can appear inaccessible because:

- `/admin` redirects unauthenticated users and rejects non-admin users (`src/worker.js:730-735`);
- the public portal has two primary-navigation systems with different Administration link handling;
- presentation migrations can hide or bypass the legacy account menu;
- local and deployed D1 migrations/configuration may differ.

The recovery must preserve these implementations while changing only outer-shell presentation.

| Capability | Previous/current implementation path | Status | Data dependency | Authentication dependency | Restoration risk | Recommended recovery |
|---|---|---|---|---|---|---|
| Admin dashboard and analytics | `admin.html`; `admin.js`; `/api/admin/dashboard`, `/api/admin/parity` in `worker.js:219-250` | Present | D1 `access_events`, users, config | Admin session | High if shell changes alter route/script loading | Add protected-route smoke tests before shell work |
| Page catalogue/create/edit | `admin.html:12`; `admin.js`; `worker.js:294-377` | Present | `content_pages`, `page_templates`, `page_access` | Admin | High; D1 can override static homepage | Preserve APIs and forms; explicitly test static and managed homepage |
| Draft/review/approve/publish/archive | `worker.js:378-397`; migration `0008` | Present | `content_page_settings`, `content_workflow_events` | Admin | High | Do not change workflow schema; regression-test transitions |
| Version history/restore | `worker.js:398-420`; `content_versions` | Present | D1 immutable revisions | Admin | High | Test save, list, restore before and after shell migration |
| Metadata/SEO/hero/related pages | `validatePage`, `savePageAdministration` in `worker.js:895-946` | Present | D1 settings/version metadata | Admin | Medium | Map managed hero config into shared hero contract, not inline shell styles |
| Managed left navigation | `worker.js:722-723`; `left_nav_json` | Present but architecturally regressed | `content_pages.left_nav_json` | Admin authoring | High | Migrate data to horizontal topic configuration without deleting fields |
| Navigation management | `/api/admin/menu`; D1 `menu_items`; `navigation.js:37-48` | Present | D1 menu taxonomy | Admin | High because methodology header uses JSON, not D1 menu | Establish one menu adapter before retiring either data source |
| Templates and styling | `page_templates`; admin template form | Present | D1 templates | Admin | Medium | Preserve template data; stop templates controlling shell/brand/width |
| Resource upload/download | `worker.js:436-470,643+`; migration `0003_resources.sql` | Present | D1 + R2 `RESOURCE_FILES` | Admin upload; published access | High | Upload/download smoke tests; do not move/delete R2 keys |
| Document and media library | `worker.js:471-506`; migration `0008:62-85` | Present | D1 `library_assets` + R2 | Admin; server delivery policy | High | Test PDF/Office/image/video metadata and download policy |
| Registration/login/logout | `worker.js:127-170`; `login.html`, `register.html`, `auth.js` | Present | users/sessions D1 | Public/session | Critical | Keep form IDs, API URLs, cookie semantics unchanged |
| Google authentication | `worker.js:737-819`; migration `0002_google_auth.sql` | Present when secrets configured | D1 + Google secrets | OAuth | Critical | Test provider availability and callback only in approved environment |
| Profile/password/reset | `worker.js:171-217,282-293`; migration `0009` | Present | users, sessions, reset tokens | User/admin | Critical | Preserve session revocation and token expiry |
| User enable/disable | `worker.js:261-270`; admin users UI | Present | users/sessions | Admin | Critical | Test disabling revokes sessions |
| Roles and permissions | `worker.js:271-281`; migration `0008:43-60,109-114` | Present, assignment UI | role tables | Admin | High | Preserve rows and assignments; note API authorization still uses legacy `user.role==='admin'` |
| Page visibility/authenticated access | `worker.js:55-70,307-325`; migration `0005` | Present, server enforced | `page_access`, config | Admin to configure | Critical | Route matrix tests for visible/hidden/authenticated states |
| Premium/restricted library content | `serveLibraryDownload` around `worker.js:654-691` | Present | asset visibility/status | User/admin | Critical | Test unauthenticated/authenticated/restricted cases |
| Download permission/watermark policy | `worker.js:663-690` | Present, server enforced | library asset flags + R2 | User/admin | Critical | Preserve server checks and response header |
| Copy deterrence | `navigation.js:99-105`; methodology equivalent | Present, client supplementary | portal config | None | Low security value | Preserve only as deterrence; never treat as authorization |
| Search/index management | `worker.js:507-521`; knowledge endpoints | Present | D1 knowledge/pages/assets | Admin rebuild; public search | Medium | Preserve search data while rebuilding Knowledge Discovery presentation |
| Audit history | migration `0008:99-107`; `auditAdmin()` | Present | D1 audit log | Admin operations | High | Ensure shell migration does not bypass API mutations |
| Administration route discoverability | Methodology header always includes `/admin` (`methodology-v10.js:36`); legacy account menu shows it only for admin (`navigation.js:91-96`) | Inconsistent | Auth API | Session | Medium | Shared account control must conditionally expose admin consistently |

## Data-preservation boundary

The required migrations are additive. No recovery commit should alter or delete:

- D1 page, version, workflow, template, access, navigation, user, session, role, resource, library, search, analytics, or audit tables;
- R2 object keys;
- managed-page source paths and slugs;
- JSON content sources used by methodology, assessment, Discover, Mobilise, and Readiness scripts.

Before Commit 1, capture local/staging row counts and route/API smoke-test results. Production migration or deployment remains out of scope.

