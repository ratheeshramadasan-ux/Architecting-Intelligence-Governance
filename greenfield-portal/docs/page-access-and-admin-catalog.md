# Page Access and Admin Catalog

**Implemented:** 26 July 2026

## What changed

The portal now has page-level access settings for every production content page:

- **Visible:** the page may appear in managed navigation and can be opened according to its sign-in setting.
- **Hidden:** the page is removed from managed navigation and returns a not-found response to non-administrators.
- **Require sign-in:** guests are redirected to sign in before the page is served.
- **Public:** when Require sign-in is off, guests can open the complete page.

Administrators can open hidden pages directly for review.

## Admin page catalog

The Pages section now:

- lists Home and all 22 production content pages;
- merges static source pages with database-managed pages;
- supports title/path search;
- provides visibility and sign-in controls on every row;
- opens an existing static page directly in the content editor;
- identifies static sources and managed content;
- continues to support new pages and manual path import.

Importing an existing page defaults its managed content status to Published so an intentional save updates the existing route.

## Data model

Migration `0005_page_access.sql` creates `page_access` with:

- canonical page path;
- display title;
- visible/hidden state;
- sign-in requirement;
- created and updated timestamps.

Seed values preserve the previous access model:

- Home, About, Contact, and Executive Career Portfolio remain public.
- Existing gated content pages require sign-in.
- All pages remain visible.

Both `.html` and extensionless Cloudflare Asset routes resolve to the same access record.

## Enforcement

- Access checks run before static or database-managed HTML is served.
- Hidden pages return HTTP 404 to guests and non-admin members.
- Sign-in pages redirect guests to `/login?next=<requested-page>`.
- Page visibility filters matching managed navigation items.
- Home and Contact visibility also control their fixed navigation entries.
- Empty navigation groups are not rendered after all their children are hidden.

## Validation

- Worker, admin, navigation, and authentication JavaScript syntax checks passed.
- D1 migration applied successfully to the local development database.
- Wrangler deployment dry-run passed.
- The admin API returned 23 unique catalog pages.
- Home and existing static pages loaded into the customization editor.
- Tested page states:

| State | Anonymous | Administrator | Navigation |
|---|---:|---:|---|
| Hidden | 404 | 200 | Removed |
| Visible and public | 200 | 200 | Included |
| Visible and sign-in required | 302 to login | 200 | Included |

- Browser-tested the admin catalog at 1280 × 800 and 390 × 844.
- Confirmed 23 visibility controls, 23 sign-in controls, 23 access-save actions, and 23 customization actions.
- Confirmed search reduces the catalog to the matching page and customization loads its current title, source path, status, and body.
- Confirmed the admin interface has no page-level horizontal overflow at 390 px.

## Deployment requirement

Apply D1 migration `0005_page_access.sql` before deploying the Worker code. No remote migration or deployment was performed during implementation.
