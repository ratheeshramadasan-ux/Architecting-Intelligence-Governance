# API reference

FastAPI publishes interactive OpenAPI at `/docs` and the machine-readable schema at `/openapi.json`.

- `GET /api/v1/health` — local service and control posture
- `GET /api/v1/sops` — retrievable approved SOP versions
- `POST /api/v1/calculations` — governed single transaction calculation; optional `llm_amount` query parameter tests model variance

Errors are fail-closed HTTP 422 responses. Calculation responses include trace ID, SOP version, rate, gross/final commission, allocations, control results, HITL requirement, final status, and evidence hash.
