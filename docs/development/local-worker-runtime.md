# Local Cloudflare Worker runtime

This path runs the actual Worker with local D1, R2, and static-asset bindings. It does not connect to production resources and must not contain production credentials or personal data.

Run all commands from the isolated development repository:

```text
C:\Users\rathe\Documents\Projects\Architecting-AI-Portal-Development
```

## First-time setup

```powershell
npm ci
npm run db:local:migrate
```

Wrangler stores local D1 and R2 state below `.wrangler/`, which is ignored by Git. The production binding names are reused, but `wrangler dev --local` supplies local simulations by default. Do not add `remote: true` to D1 or R2 for routine development.

The migration command applies the existing repository migrations to the local database named `architecting-ai-portal`. It creates schema and non-personal seed/configuration records only. Never import production users, sessions, access events, reset tokens, uploaded documents, or analytics into this database.

## Start the full Worker

```powershell
npm run dev:worker
```

The default origin is `http://127.0.0.1:8787`. Use `npm run dev:local` only when a static-only rendering check is intended; it does not exercise D1, R2, managed content, authentication gates, navigation APIs, or theme APIs.

## Validate the Worker

In a second terminal:

```powershell
npm run validate:worker
node scripts/validate-live.mjs http://127.0.0.1:8787
```

Representative manual checks:

```powershell
Invoke-WebRequest http://127.0.0.1:8787/ -UseBasicParsing
Invoke-RestMethod http://127.0.0.1:8787/api/theme
Invoke-RestMethod http://127.0.0.1:8787/api/navigation
Invoke-RestMethod http://127.0.0.1:8787/api/auth/me
Invoke-WebRequest http://127.0.0.1:8787/pages/about.html -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:8787/pages/agentic-ai.html -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:8787/admin -MaximumRedirection 0 -SkipHttpErrorCheck
```

Expected anonymous behaviour:

- `/` and `/pages/about.html` return 200.
- `/api/auth/me` returns `{ "user": null }`.
- a protected static page returns a sign-in preview rather than full content.
- `/admin` redirects to `/login?next=/admin`.
- missing local R2 objects do not fall through to public static content.

## Local identities

Do not use production credentials. If interactive member testing is necessary, register a synthetic local address such as `member.local@example.test` and a unique local-only password. Admin authorization currently derives from configured admin email values; do not change production values or insert production credentials for testing. Admin-route authentication can be validated safely through its anonymous redirect and unauthorized response contracts. A future dedicated test configuration may provide synthetic admin identity fixtures without changing production authorization rules.

Google OAuth should remain unavailable locally unless a separately approved development OAuth client is supplied through an uncommitted `.dev.vars` file. Never commit `.dev.vars` or OAuth secrets.

## R2 safety

`wrangler dev --local` uses local R2 storage. Validate download behavior with nonexistent or synthetic objects only. Do not configure the production bucket as a remote binding and do not copy production resources into local state.

## Reset considerations

Local state is disposable, but removal is intentionally not automated. If a clean local database is required, stop the Worker, identify the exact project-local `.wrangler` state path, and obtain explicit approval before removing it. Reapply migrations afterward with `npm run db:local:migrate`.
