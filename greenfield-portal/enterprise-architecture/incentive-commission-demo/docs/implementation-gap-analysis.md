# Phase 2 — Full Governance Acceptance Audit

Audit date: 2026-09-09  
Scope: current local source only; no code remediation and no deployment.  
Rating rule: a label, fixture, button, document, or API response is not counted as enforcement unless a server-side path executes it.

## Scorecard

| Capability | Real | Partial | Mock | Missing |
|---|:---:|:---:|:---:|:---:|
| 1. RAG document ingestion |  | ✓ |  |  |
| 2. PII & Sensitive Data Library |  | ✓ |  |  |
| 3. Document PII review |  | ✓ |  |  |
| 4. AI Data Contract |  | ✓ |  |  |
| 5. Tokenization |  | ✓ |  |  |
| 6. Rehydration |  | ✓ |  |  |
| 7. Security context |  |  |  | ✓ |
| 8. Real RAG |  |  |  | ✓ |
| 9. SOP temporal control |  | ✓ |  |  |
| 10. LLM rule interpretation |  |  | ✓ |  |
| 11. Deterministic calculation | ✓ |  |  |  |
| 12. Dual calculation control |  | ✓ |  |  |
| 13. Duplicate control |  | ✓ |  |  |
| 14. Historical anomaly |  |  |  | ✓ |
| 15. Compliance control |  | ✓ |  |  |
| 16. HITL |  |  | ✓ |  |
| 17. RBAC / segregation of duties |  | ✓ |  |  |
| 18. Audit evidence |  | ✓ |  |  |
| 19. Ten golden scenarios |  | ✓ |  |  |
| 20. UI demo readiness |  |  | ✓ |  |
| **Totals** | **1** | **13** | **3** | **3** |

`PARTIALLY IMPLEMENTED` means at least one relevant operation is executable, but the required end-to-end governance outcome is not. `MOCKED / SIMULATED` means the experience is represented without a corresponding operational backend. `REAL / EXECUTABLE` applies only to the bounded capability stated—not production readiness.

## Requirement evidence matrix

| # | Requirement and status | Exact implementation | API / database / UI | Automated test | Server-side enforcement, gaps, and recommendation |
|---|---|---|---|---|---|
| 1 | **RAG document ingestion — PARTIALLY IMPLEMENTED** | `backend/rag/documents.py`: `inspect_document`, `may_activate`, `chunk_markdown`; `documents/original/*`; `documents/rag-safe/*` | No upload API. No document tables. UI: SOP / RAG lifecycle and Upload button in `frontend/app.js`, but the button has no handler. | `tests/test_documents.py` tests a local Markdown file and the activation predicate. | **Partial enforcement only.** Local PDF/DOCX text and table extraction can execute; Markdown heading chunking can execute; sensitive detection is called. There is no file validation, durable finding creation, review workflow, sanitization, RAG-safe generation, embedding, vector storage, retrieval validation, approval transition, or persisted lifecycle. `may_activate` can reject unresolved high/critical findings, but no activation endpoint calls it. Implement document, version, finding, review, chunk and lifecycle tables plus guarded transition services and upload/review APIs. |
| 2 | **PII & Sensitive Data Library — PARTIALLY IMPLEMENTED** | `data/master/pii-sensitive-library.json`; `backend/models/schemas.py`: `Handling`; `backend/privacy/gateway.py`: hardcoded `PATTERNS` | No API. No database table. UI: a six-row contract summary only; no library editor. | Indirect handling coverage in `test_tokenization_preserves_financial_values`; no policy lifecycle tests. | **Not runtime-configurable.** JSON has only 6 of 16 required categories and is never loaded by the gateway. There is no pending/approved policy version or approval enforcement. Implement versioned `sensitive_categories`, `policy_versions`, `policy_rules`, and `policy_approvals`; runtime must resolve only ACTIVE snapshots. |
| 3 | **Document PII review — PARTIALLY IMPLEMENTED** | `backend/privacy/gateway.py`: `detect_sensitive`; `backend/rag/documents.py`: `inspect_document`; blocked v3 fixture | No API or tables. UI displays one static SIN finding; no original/RAG-safe comparison. | `test_sensitive_document_detection`, `test_sensitive_sop_is_blocked`. | **Only SIN, EMAIL and BANK_ACCOUNT regexes execute.** Required PERSON_NAME, PHONE, DEALER_ID, FINANCIAL_AMOUNT, and business/rule data are not detected. No persisted findings, reviewer decision, token-aware sanitization, or structural preview exists. The full supplied sentence would yield EMAIL, SIN, BANK_ACCOUNT only. Implement typed detectors, location evidence, reviewer decisions and a sanitizer that preserves `$850,000` and `15 bps` while tokenizing identity/account values. |
| 4 | **AI Data Contract — PARTIALLY IMPLEMENTED** | `backend/governance/contracts.py`: `DataContract`, `ACTIVE_CONTRACT`, `require_active`; `backend/privacy/gateway.py`: `apply_contract`; `backend/services/processing.py`: `process` | `POST /api/v1/calculations`. No contract tables/API. UI: static ADC-INC-04 v3 card. | `test_unclassified_field_fails_closed`, `test_tokenization_preserves_financial_values`. | **Fail-closed behavior is real for the single in-memory contract.** An `unknown_fields` value blocks before any model call; however there is no model call to prove non-invocation, no `FIELD_NOT_APPROVED_FOR_AI` error code, no governance/security event, only one automation contract, and several required example fields are absent. Persist versioned contracts and mappings, load ACTIVE contract per automation, emit coded events, and instrument a model-call boundary test. |
| 5 | **Tokenization — PARTIALLY IMPLEMENTED** | `backend/privacy/gateway.py`: `TokenVault.tokenize`, `apply_contract` | Used by calculation service before its simulated model stage. No vault table/service/API. UI merely states tokenization. | `test_tokenization_preserves_financial_values`. | **Executable but insufficient.** Tokens are deterministic hashes, not type-aware, not trace/request-bound, and collision/tenant boundaries are absent. The in-memory mapping is trusted-process-only and not added to evidence, which is good, but no actual LLM receives the safe payload. Implement random opaque typed tokens bound to trace/session with expiry and audited access; pass only the transformed payload to the model adapter. |
| 6 | **Rehydration — PARTIALLY IMPLEMENTED** | `backend/privacy/gateway.py`: `TokenVault.rehydrate` | No API/table/UI. | No rehydration test. | **Only token existence plus a caller-supplied boolean is enforced.** There is no trace, session, expiry, destination policy, or security event; TRACE-A/TRACE-B cannot be tested. Implement a separate trusted service whose authorization context is server-derived and which validates trace, session, TTL and destination before access. |
| 7 | **Security context — NOT IMPLEMENTED** | `backend/security/rbac.py` contains standalone helpers; no authentication dependency or middleware uses them. | Calculation request accepts `submitted_by` from the caller. No user/session/resource tables used. UI user identity is static. | Standalone RBAC helper assertions only. | **Not enforced in the business API.** The caller can supply dealer IDs and submitter identity; no authenticated session establishes resource scope. Implement authentication middleware/dependency, immutable request security context, resource authorization repositories, and remove identity/role fields from user-controlled model payloads. |
| 8 | **Real RAG — NOT IMPLEMENTED** | `chunk_markdown` produces local section dictionaries; `processing.py` hardcodes `retrieved_chunks=["4.2","7.1","11.3"]`. | No retrieval API, vector binding, index, or chunk table. UI evidence is static. | No retrieval test. | **No Cloudflare Vectorize, embeddings, local vectors, semantic search, keyword search, filters, or agent retrieval exists.** Full SOPs are not sent either; no model exists. Implement chunk persistence and embeddings, Vectorize adapter, ACTIVE/SOP/version/effective-date filters, table-aware chunks, top-k retrieval, citations and negative retrieval tests for DRAFT/BLOCKED/PENDING. |
| 9 | **SOP temporal control — PARTIALLY IMPLEMENTED** | `backend/calculation/engine.py`: `sop_for`, `calculate` | `POST /api/v1/calculations` uses caller-supplied `transaction_date`; `GET /api/v1/sops` is static. No registry tables. | `test_effective_date_selects_version` covers 2026-06-30 and 2026-07-01. | **Boundary selection is real for ordinary calculations.** It does not distinguish recognition, funding, correction, cancellation, or processing dates, nor consult a version registry. Prior-period corrections happen to use v1 only if the caller passes the original date; there is no correction/clawback policy. Add transaction event dates, persisted SOP effective ranges, correction/cancellation resolution, and temporal tests. |
| 10 | **LLM rule interpretation — MOCKED / SIMULATED** | No Gemini/ADK client or model adapter. `processing.py` hardcodes model name and chunk IDs; `calculation/engine.py` hardcodes rules. | Calculation API does not call an LLM. UI says Gemini interpreted rules. No tables. | None. | **No interpretation occurs.** There is no structured schema for SOP version, sources, rule IDs, operations, precedence, rounding, or reasoning summary. Implement an ADK/model adapter receiving retrieved chunks plus safe inputs and returning schema-validated declarative operations; store a concise rationale, never chain-of-thought. |
| 11 | **Deterministic calculation — REAL / EXECUTABLE (bounded)** | `backend/calculation/engine.py`: `calculate`, `sop_for`; uses `Decimal` and `ROUND_HALF_UP` | `POST /api/v1/calculations`. No calculation tables are persisted. UI shows a static calculation. | Three calculation tests cover version boundary, known amount, and allocation reconciliation. | **Genuinely server-side and independent of model formatting.** No `eval`, generated Python, arbitrary SQL, or JS execution is present. Current rule set is hardcoded and limited; it lacks declarative constrained operations, cancellation/clawback, adjustments and tier tables. Introduce a whitelist (`ADD`, `SUBTRACT`, `MULTIPLY`, `DIVIDE`, `MIN`, `MAX`, `BPS`, `PERCENT`, `TIER_LOOKUP`, `ROUND`) and persist inputs/outputs. |
| 12 | **Dual calculation control — PARTIALLY IMPLEMENTED** | `backend/controls/engine.py`: optional `llm_amount` comparison; `processing.py` passes query value | `POST /api/v1/calculations?llm_amount=...`. No exception/case tables. UI has static mismatch row only. | `test_llm_variance_blocks_payment`. | **Exact Decimal comparison and BLOCKED status are real.** The “LLM amount” is supplied by an API query, not model output; no variance amount, `CALCULATION_MISMATCH` code, payable flag, manual-review case, or persisted event exists. Add structured comparison result, tolerance policy, case creation and payment gate. |
| 13 | **Duplicate control — PARTIALLY IMPLEMENTED** | `backend/services/processing.py`: static `EXISTING_IDS`; `backend/controls/engine.py`: `CTRL-DUP-001` | Calculation API. No transaction/duplicate/case tables. UI shows static potential duplicate. | `test_duplicate_requires_hitl`. | **One exact reference match is executable and blocks.** It returns generic `BLOCKED`, not `BLOCKED_DUPLICATE`. No repository lookup, probable matching across dealer/customer/amount/date/product, HOLD state, case, or owner assignment exists. Implement exact database uniqueness and weighted probable-match control with persisted candidates and review lifecycle. |
| 14 | **Historical anomaly — NOT IMPLEMENTED** | No anomaly service or dealer history query. | No API/table use. UI contains a static anomaly row for DLR-1088, not required DLR10023. | None. | No $8K–$11K baseline, $27,850 current value, review decision, or payment hold exists. Implement historical feature retrieval, configurable threshold/baseline control, `MANUAL_REVIEW_REQUIRED`, payable=false, and explainable evidence. |
| 15 | **Compliance control — PARTIALLY IMPLEMENTED** | `TransactionRequest.compliance_eligible`; `controls.evaluate`: `CTRL-COMP-001` | Calculation API. Synthetic `COMPLIANCE_STATUS` fixture is not queried. UI shows static hold transaction. | The golden execution and engine behavior demonstrate blocking, but there is no dedicated compliance test. | **Calculation completes and status becomes BLOCKED when caller sends false.** There is no independently sourced status, explicit `COMPLIANCE_HOLD`, payable flag, participant-level lookup, persistence, or event. Query compliance as-of effective time from a trusted repository and make payment eligibility a separate result. |
| 16 | **HITL — MOCKED / SIMULATED** | UI approval rows and `hitl_required` boolean only. | No approval endpoint. No approval model/table; synthetic `APPROVALS` is an empty JSON array. | None. | No persisted approval object, state transition, authorization, rejection, execution revalidation, idempotency, or SOR/payment update. Implement approval/case tables and APIs; approval authorizes revalidation, never direct payment. |
| 17 | **RBAC / segregation of duties — PARTIALLY IMPLEMENTED** | `backend/security/rbac.py`: `ROLE_PERMISSIONS`, `authorize`, `enforce_sod` | Not called by any endpoint. No role/permission tables; UI rows are static and use different role names. | `test_rbac_and_segregation_of_duties` invokes helpers directly. | **Logic helpers deny unsupported permission and same-user approval, but business state cannot change because approval does not exist.** Required roles PROCESSOR, INCENTIVE_MANAGER, POLICY_OWNER, PRIVACY_OFFICER, SECURITY_REVIEWER are not modeled. Persist roles/duties, integrate checks into every mutation, emit `SOD_VIOLATION`, and verify atomic no-change behavior. |
| 18 | **Audit evidence — PARTIALLY IMPLEMENTED** | `processing.py` builds an in-memory evidence dict/hash; `repositories/audit.py` defines `AuditEvent` and `append` | `audit_events(trace_id, created_at, evidence_json, evidence_hash)` exists after seed, but `append` is never called. UI trace/evidence is static and numerically inconsistent with the engine ($2,847.60 vs executable $2,849.28). | No persistence, immutability, completeness, redaction, or hash verification test. | **Hash construction executes but evidence is discarded and response exposes only the hash.** Missing user, effective date, calculation inputs, exceptions, approvals, overrides and timestamp. No append-only protection. Positively, raw vault mappings, JWTs, credentials and chain-of-thought are not added. Call an append-only repository transactionally, validate a complete schema, redact prohibited fields and implement integrity verification. |
| 19 | **Ten golden scenarios — PARTIALLY IMPLEMENTED** | `data/golden/acceptance-scenarios.json`; calculation and control services | Only single-calculation API; no scenario runner/batch endpoint. UI buttons use a timer and do not call the API. | Existing 11 tests cover fragments, not ten end-to-end expected/actual scenarios. | Seven scenarios can be approximated with current input fields; SCN-05 and SCN-09 do not produce required outcomes; SCN-10 is not runnable. RAG and evidence expectations are never exercised. Implement executable fixtures and a runner that asserts the complete result contract. See `docs/golden-scenario-results.md`. |
| 20 | **UI demo readiness — MOCKED / SIMULATED** | `index.html`, `frontend/app.js`, `frontend/styles.css` | Static SPA served at the requested route. It performs no `fetch` calls. All rows, traces, findings, contracts and execution results are literals. | No UI tests. | Navigation and responsive presentation work, but most required demonstrations are absent or non-operational: no library editor, upload, findings review, handling comparison, original/RAG-safe preview, chunk explorer, retrieval test, live processing trace, dual calculation view, anomaly details, real approvals, SoD denial, or persisted evidence. Connect pages to APIs after server capabilities exist and show loading/error/authorization states. |

## RAG ingestion stage audit

| Stage | Status | Evidence |
|---|---|---|
| Upload | Not implemented | UI button only; no file input or endpoint. |
| File validation | Not implemented | Extension selects parser but no MIME, size, signature, malware or corruption validation. |
| PDF parsing | Partial/executable | `pypdf.PdfReader` extracts page text. |
| DOCX parsing | Partial/executable | `python-docx` extracts paragraph text and table cell text. |
| Paragraph extraction | Partial/executable | DOCX paragraphs only; structure/location is discarded. |
| Heading extraction | Partial | Markdown `#` headings only; no DOCX style or PDF heading inference. |
| Table extraction | Partial | DOCX cell rows become pipe-delimited text; table structure/metadata is not preserved. |
| Footnotes | Not implemented | No parser path. |
| Sensitive detection | Partial/executable | Three regex categories only. |
| Findings creation | Simulated | Returned transiently, never persisted. |
| Human review | Not implemented | No object, API or transition. |
| Sanitization | Not implemented | No transformation service. |
| RAG-safe representation | Simulated | Manually authored file only. |
| Chunking | Partial/executable | Markdown heading chunks only. |
| Embeddings | Not implemented | No embedding client/model. |
| Vector storage | Not implemented | No Vectorize/local index. |
| Retrieval validation | Not implemented | No retrieval path. |
| Approval | Simulated | Text in a fixture only. |
| ACTIVE transition | Not implemented | Predicate exists but no lifecycle service/persistence. |

An unresolved PII document cannot pass the standalone `may_activate` predicate, but it **can be represented as ACTIVE anywhere else** because there is no authoritative persisted lifecycle or guarded activation operation. Conversely, no ACTIVE document is actually retrievable, and DRAFT/BLOCKED/PENDING exclusion cannot be verified because no retrieval implementation exists.

## Required sensitive category coverage

| Category | Config fixture | Executable detector | Runtime contract support |
|---|:---:|:---:|:---:|
| PERSON_NAME | ✓ |  | customer name only |
| EMAIL |  | ✓ |  |
| PHONE |  |  |  |
| ADDRESS |  |  |  |
| DATE_OF_BIRTH / DOB |  |  |  |
| SIN | ✓ | ✓ | no request field |
| BANK_ACCOUNT | ✓ | ✓ | no request field |
| CREDIT_CARD |  |  |  |
| CUSTOMER_ID |  |  |  |
| EMPLOYEE_ID |  |  |  |
| DEALER_ID | ✓ |  | dealer IDs allowed |
| FINANCIAL_AMOUNT | ✓ |  | principal allowed |
| COMMISSION_AMOUNT |  |  |  |
| SALARY |  |  |  |
| AUTH_SECRET | ✓ |  |  |
| SECURITY_SECRET |  |  |  |
| CONFIDENTIAL_BUSINESS_DATA |  |  |  |

For the required review sample, current detection finds EMAIL, SIN and BANK_ACCOUNT. It misses Sarah Morgan, the phone, dealer ID, financial amount and `15 bps`. It cannot produce the required RAG-safe transformation.

## Conclusions

### 1. What is genuinely working now

- Decimal-based mortgage, lending and investment calculation with v1/v2 rates, segment/new-to-bank/volume/campaign factors, cap/floor and allocation.
- Basic effective-date boundary selection from the transaction date.
- A single in-memory active data contract with fail-closed unknown-field behavior.
- In-process token replacement for selected fields without adding the vault mapping to evidence.
- Exact transaction-reference blocking against a static set, compliance blocking from a request flag, allocation reconciliation, and exact LLM-amount variance blocking.
- Local PDF/DOCX text extraction, limited sensitive regex detection, Markdown chunking, and an activation predicate.
- Standalone RBAC and same-user SoD helper functions.

### 2. What is currently simulated

- Every frontend record, status, trace, approval, RAG stage, contract, finding and execution outcome.
- Gemini interpretation, retrieved chunk citations and model identity.
- RAG-safe approval metadata, lifecycle states and document activation.
- HITL queues, approval decisions and immutable audit evidence.

### 3. What must be implemented for the live demo

1. Trusted authentication/security context and independently enforced resource authorization.
2. Durable versioned governance schema for categories, policies, contracts, documents, findings, chunks, approvals, cases, calculations, controls and audit evidence.
3. Complete guarded document lifecycle with upload, review, sanitizer, embeddings, Vectorize, filtered retrieval and citations.
4. Actual Gemini/ADK structured interpretation behind the privacy/RAG boundary.
5. Probable duplicate, anomaly, compliance-as-of, correction, cancellation/clawback and payment eligibility controls.
6. Persisted HITL and controlled idempotent execution with state revalidation.
7. End-to-end evidence persistence and connected UI/API flows.

### 4. What can safely remain simulated for a portfolio prototype

- Final bank payment/SOR may remain a clearly labelled simulator if the execution boundary, revalidation and idempotency are real.
- Enterprise identity can use seeded local users/sessions if identity remains server-derived and RBAC/SoD are enforced.
- External campaign, dealer and compliance source systems can use durable synthetic repositories.
- Model responses can be recorded/replay fixtures for an offline mode, provided the UI labels replay mode and tests separately cover the real adapter contract.
- Vectorize may have a local deterministic test adapter, but it must not be described as Cloudflare RAG unless the cloud binding is actually configured and exercised.

### 5. Critical blockers

- No real retrieval or model execution despite UI claims.
- No trusted security context; caller-controlled identifiers reach business logic.
- No authoritative governance persistence or lifecycle transitions.
- No real approval/execution boundary or payment eligibility model.
- Evidence is neither complete nor persisted, and UI evidence conflicts with executable calculation output.

### 6. Recommended implementation sequence

1. Define the durable governance and operational schema with append-only evidence and explicit state machines.
2. Add authentication context, resource authorization, required roles and SoD to all mutation boundaries.
3. Implement versioned PII library and AI Data Contract activation/approval; make the gateway resolve ACTIVE snapshots from the database.
4. Implement trace-bound typed tokenization, authorized rehydration and security events.
5. Complete document upload, structural parsing, findings review, sanitization, approval and lifecycle enforcement.
6. Add embeddings/Vectorize plus ACTIVE/version/effective-date filtered retrieval and citation validation.
7. Add schema-constrained Gemini/ADK interpretation and the constrained deterministic operation executor.
8. Complete duplicate, anomaly, compliance, temporal correction and clawback controls.
9. Build persisted HITL cases and idempotent controlled execution with revalidation.
10. Connect the UI, then make all ten scenarios executable end-to-end and verify the evidence package.
