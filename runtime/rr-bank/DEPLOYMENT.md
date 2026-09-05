# RR Bank demo deployment runbook

## Target topology

`https://ai.rrlabs.ca/enterprise-architecture/banking-agent-demo/`
→ Cloudflare Worker static portal
→ RR Bank chat calls the Python runtime over HTTPS
→ Railway FastAPI service
→ Google ADK / Gemini
→ MCP subprocess
→ internal FastAPI business endpoints
→ trusted demo identity / authorization
→ SQLite demo system of record

## Railway service

Source repository: `ratheeshramadasan-ux/Architecting-Intelligence-Governance`

Recommended branch during validation: `rr-bank-runtime-e2e`

Repository config file: `/railway.json`

Dockerfile: `/runtime/rr-bank/Dockerfile`

Health check: `/health`

Required variables:

- `GOOGLE_API_KEY` = secret Gemini API key (do not commit)
- `ALLOWED_ORIGINS=https://ai.rrlabs.ca,https://rr-bank-runtime-e2e-architecting-ai.ratheesh-ramadasan.workers.dev`
- `DEBUG_RUNTIME=0`

Railway supplies `PORT` automatically.

After deployment, generate a Railway public HTTPS domain and verify:

- `GET https://<railway-domain>/health` → `{ "status": "ok" ... }`
- `GET https://<railway-domain>/api/models` → Gemini 2.5 Flash enabled

## Connect the Cloudflare UI

Set `enterprise-architecture/banking-agent-demo/config.js`:

```js
window.RR_BANK_CONFIG = {
  apiBase: "https://<railway-domain>",
  chatStreamPath: "/api/chat/stream",
  modelsPath: "/api/models"
};
```

Validate from the Cloudflare branch preview before merging PR #10.

## Acceptance tests

1. `What is my chequing balance?` → CAD 8,420.32.
2. `Show my last five chequing transactions.` → five authoritative seeded transactions.
3. `What is my chequing balance and show my last five transactions?` → both tools execute in one request.
4. `What is the balance of account ACC200008?` → no existence confirmation and no balance; external result `RESOURCE_NOT_ACCESSIBLE` / blocked trace.
5. `Increase my credit limit to $30,000.` → `PENDING_APPROVAL`; request ID returned; no autonomous execution.
6. Live request path visibly advances from chat → edge/identity → agent → configured LLM → MCP → business API → system of record using actual streamed runtime events.
7. Model selector is populated by `/api/models`; disabled providers cannot be selected or forced by editing the browser request.

## Production hardening after the interview demo

Replace hardcoded demo identity with real OIDC/JWT validation; move SQLite to PostgreSQL; make sessions durable; place runtime behind a dedicated API hostname/Cloudflare policy; move PII token mappings to an encrypted client-controlled vault; add rate limits, structured audit persistence, SIEM export and secret rotation.
