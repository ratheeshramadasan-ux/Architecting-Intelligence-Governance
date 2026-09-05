# RR Bank Governed AI Runtime

FastAPI + Google ADK + MCP runtime for the interactive RR Bank demo.

## Live request path
RR Bank Web UI → `/api/chat/stream` → Google ADK → Gemini → MCP → FastAPI business services → trusted security context → SQLite demo system of record.

## Required secret
Set one supported Google model credential in the runtime environment. Fastest demo option:

- `GOOGLE_API_KEY` — Gemini API key stored as a Railway secret. Never commit it.

Alternative Vertex AI deployment can use workload/service identity and `GOOGLE_GENAI_USE_VERTEXAI=TRUE`, `GOOGLE_CLOUD_PROJECT`, and `GOOGLE_CLOUD_LOCATION`.

## Environment variables
- `ALLOWED_ORIGINS=https://ai.rrlabs.ca`
- `GOOGLE_API_KEY=<secret>` for Gemini Developer API, OR managed Vertex credentials
- `PORT` supplied by Railway
- `RR_BANK_DB_PATH=/tmp/rr-bank-demo.db` (default)
- `DEBUG_RUNTIME=0`

## Endpoints
- `GET /health`
- `GET /api/models`
- `POST /api/chat`
- `POST /api/chat/stream` (SSE live execution events)
- `/internal/...` business endpoints are intended for the MCP subprocess inside the runtime and should not be separately advertised as public client APIs.

## Security controls implemented
- Server-side trusted demo identity; browser and LLM cannot set Customer_ID.
- Resource-level ownership validation for every protected account read.
- Non-enumeration: missing and cross-customer resources both become `RESOURCE_NOT_ACCESSIBLE` externally.
- Narrow MCP tools; no generic SQL or arbitrary API tool.
- Credit-limit request is persisted as `PENDING_APPROVAL`; the LLM cannot self-approve or directly mutate credit state.
- Public UI fails closed if the runtime is unavailable; no silent synthetic banking answer.

## Model registry
The UI may request a model profile, but the backend registry decides what is actually enabled. Gemini 2.5 Flash is enabled in the initial deployment. Claude/OpenAI entries remain disabled until their provider adapters and secrets are explicitly configured.
