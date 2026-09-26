# FP-1 Functional Gap Report

Date: 2026-07-28  
Scope: archived portal (`greenfield-portal - backup`), redesigned portal, Worker routes, D1 migrations, R2 document storage, authentication and shared shell.

## Evidence baseline

- The archived portal contains static public content and navigation, but no administration page, administration JavaScript, administration API, user database, workflow or library implementation.
- Before FP-1, the redesigned portal already contained protected `/admin`, password and Google authentication, registration, page and template management, navigation management, R2 resource uploads, visibility/sign-in controls, analytics and user enable/disable controls.
- FP-1 preserves those capabilities and adds missing administration structures through migrations `0008_admin_feature_parity.sql` and `0009_account_recovery.sql`. Both migrations are additive.

## Comparison matrix

| Capability | Original/archive evidence | Pre-FP-1 status | FP-1 result | Validation |
|---|---|---:|---:|---|
| Public portal and shared navigation | Static HTML/CSS/JS | Present | Preserved | 188-route validation passed |
| Shared enterprise footer | No reusable archived component | Present through shared shell, previously regressed visually | Restored/preserved globally | Desktop and mobile structure verified; cream `rgb(217,213,202)` retained |
| Administration dashboard | Not present in archive | Present | Preserved and expanded | Protected route and metrics rendered |
| Page catalogue | Not present | Present | Preserved | 25 public routes listed locally |
| Create/edit/delete page | Not present | Partial: create/edit only | Restored | Authenticated create/edit passed; delete is an audited soft-delete that retains content and versions |
| Draft/publish/archive | Not present | Partial: draft/published only | Restored | Draft → in-review transition passed; published/archive endpoints implemented |
| Preview | Not present | Present | Preserved | Preview path retained in page editor |
| Metadata and SEO | Not present | Missing | Restored | Stored with page settings and versions |
| Hero configuration | Not present | Missing | Restored | Headline, description and safe asset path stored |
| Related pages | Not present | Missing | Restored | Canonical portal paths stored as JSON |
| Rich content editor | Not present | Partial HTML editor | Restored | Sanitised HTML editor, semantic source and versioned saves |
| Content workflow/approvals | Not present | Missing | Restored | Draft, in review, approved, published, archived |
| Version history/restore | Not present | Missing | Restored | Immutable version created and queried locally |
| Navigation management | Static markup | Present | Preserved | Server-managed hierarchy and visibility |
| Templates and styling | Not present | Present | Preserved | Existing template CRUD retained |
| Document uploads | Static downloads only | Present as resources | Expanded | R2-backed document library implemented |
| Media library | Static images only | Missing | Restored | Image/video/audio classification and metadata implemented |
| Categories/tags/versions | Not present | Partial category only | Restored | Library schema and UI implemented |
| Related pages/visibility/downloads | Not present | Partial | Restored | Server-enforced library policy implemented |
| User registration/login | Not present | Present | Preserved | Password and Google flows retained |
| User approval/disable | Not present | Present | Preserved | Account status control and session revocation retained |
| Profile management | Not present | Missing | Restored API | Authenticated name update implemented |
| Password management/recovery | Not present | Missing | Restored | Authenticated change and administrator-issued 30-minute reset links |
| Roles and permissions | Admin/member only | Partial | Restored | Administrator/editor/reviewer/member definitions and assignments |
| Page access control | Not present | Present | Preserved | Worker enforces hidden/authenticated content before delivery |
| Premium/restricted assets | Not present | Missing | Restored | Public/authenticated/restricted library visibility |
| Copy deterrence | Not present | Present client-side | Preserved with limitation documented | Never treated as a security boundary |
| Watermark configuration | Not present | Missing | Restored policy | Per-asset policy stored and delivery header emitted |
| Analytics | Not present | Present | Expanded | Page counts and 30-day activity retained |
| Search/index management | Static indexes | Missing admin control | Restored | Authenticated rebuild inventory completed with 8 records locally |
| Publishing controls | Draft/published selector | Partial | Restored | Approval, publish, archive and scheduling fields |
| System settings | Not present | Present | Preserved | Registration, public routes, previews and copying |
| AI-assisted authoring | Not present | Missing | Restored | Governed editorial brief generator returns human-review-required draft |
| Audit history | Not present | Missing | Restored | Administrative mutations recorded server-side |

## Security observations

- Admin APIs require an active administrator session.
- Mutations require same-origin requests.
- Page visibility and authentication are enforced by the Worker.
- Library visibility and download permissions are enforced before R2 streaming.
- Existing client copy deterrence is supplementary only.
- Uploaded HTML removes scripts, iframes, inline event handlers and JavaScript URLs.
- Existing records are retained; page deletion is represented by archival workflow.

## Dark mode

The approved public portal does not implement a supported dark-mode theme. FP-1 therefore does not introduce one.
