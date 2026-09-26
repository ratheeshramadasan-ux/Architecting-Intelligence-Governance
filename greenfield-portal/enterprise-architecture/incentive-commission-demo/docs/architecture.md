# Architecture

The trusted FastAPI application establishes identity and role context before any model interaction. The active, versioned AI Data Contract drives a fail-closed privacy gateway. A token vault holds reversible values only in trusted application memory; the model receives tokens, masks, generalized values, derived values, or approved source values.

Only privacy- and policy-approved `ACTIVE` SOP versions may be retrieved. The production target uses Cloudflare Vectorize with Workers AI embeddings and metadata filters on SOP, version, section, and status. The prototype preserves that boundary through the RAG service and structured source artifacts; it does not silently substitute an unapproved document.

Gemini / Google ADK is the intended rule interpreter. It must return a schema-constrained interpretation—never executable code. The Python calculation engine re-computes the result with `Decimal`; governance controls compare interpretation, input, result, duplicate, compliance, cap, and allocation evidence. The model has no payment tool or approval permission.

```text
Authenticated user → trusted security context → active data contract
→ privacy gateway / token vault → pre-model DLP → approved RAG retrieval
→ structured Gemini interpretation → deterministic calculation
→ controls → output DLP → authorized rehydration → HITL → execution boundary
→ append-only evidence
```

The SQLite repository is an initial local adapter. Repository interfaces isolate persistence so D1 or an enterprise system of record can replace it without moving policy into route handlers.
