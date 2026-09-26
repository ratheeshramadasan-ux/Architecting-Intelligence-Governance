# Golden Scenario Execution Results

Audit run: 2026-09-09 against the current local Python services.  
Method: direct invocation of `backend.services.processing.process` using representable scenario inputs. No source was changed to make a scenario pass. RAG, model, persistence, approvals and UI were not counted because the processing service does not execute them.

## Scorecard

| Result | Count |
|---|---:|
| Pass for current bounded expectation | 7 |
| Partial / false positive | 1 |
| Fail | 1 |
| Not runnable | 1 |

The seven “pass” results validate only current deterministic/control behavior, not the complete end-to-end acceptance contract. None validates real RAG, Gemini, persistent HITL or immutable evidence.

| Scenario | Expected | Actual execution | Result | Missing acceptance evidence |
|---|---|---|---|---|
| SCN-01 Standard calculation | v2; base calculation; controls pass; tokenization; CALCULATED | `$640,000 × 0.42% = $2,688.00`; v2; CALCULATED; no HITL | **Pass (bounded)** | No RAG retrieval, Gemini interpretation, persisted trace or scenario-specific expected numeric amount in fixture. |
| SCN-02 Volume threshold crossing | v2; +0.08 accelerator; CALCULATED | `$200,000`, prior volume `$850,000`; multiplier 1.08; `$907.20`; CALCULATED | **Pass (bounded)** | No historical repository lookup; caller supplies volume. No RAG section verification. |
| SCN-03 Premium + campaign stacking | v2; segment then bonus then campaign; CALCULATED | `$500,000`; premium + new-to-bank + CMP-FALL-26; multiplier 1.221; `$2,564.10`; CALCULATED | **Pass (bounded)** | No eligibility lookup, structured rule interpretation, citation or persisted calculation detail. |
| SCN-04 Duplicate | Calculation preserved; duplicate fail; HITL; BLOCKED | Static exact ID match; `$420.00`; BLOCKED; HITL=true | **Pass for exact duplicate only** | No probable duplicate detection, `BLOCKED_DUPLICATE` code, process-owner case or persistence. |
| SCN-05 Cancellation/clawback | 100% clawback inside 90 days; HITL; REVIEW | Request model has no cancellation inputs. Normal `$420.00`; CALCULATED; HITL=false | **Fail** | Cancellation date, original payment, window calculation, clawback record/control, approval threshold and status are absent. |
| SCN-06 Compliance hold | Preserve calculation; compliance fail; HITL; BLOCKED | With caller flag false: `$420.00`; BLOCKED; HITL=true | **Pass (bounded)** | No trusted compliance lookup/as-of date, `COMPLIANCE_HOLD`, payable=false field or case. |
| SCN-07 Split dealer allocation | Equal split with rounding residue; CALCULATED | `$270.00` split `$90.00` each across D1/D2/D3; reconciles; CALCULATED | **Pass (bounded)** | No participant eligibility or approved allocation repository. |
| SCN-08 SOP temporal version | v1 on/before 2026-06-30; correct v1 rate | 2026-06-30 selects v1 and returns `$380.00`; boundary unit test also confirms 2026-07-01 selects v2 | **Pass (bounded)** | No recognition-date policy or registry query; processing vs transaction date is not explicitly modeled. |
| SCN-09 Prior-period correction | Original v1 retained after v2 activation; policy-owner HITL; REVIEW | Passing original 2026-06-30 date returns v1 and `$380.00`, but CALCULATED with HITL=false | **Partial / false positive** | No correction identity, processing date, linkage to original transaction, override or review workflow. Version result is incidental to caller-supplied date. |
| SCN-10 Complex end-to-end batch | Mixed versions; per-record totals; all controls; privacy; HITL; PARTIAL | No batch API/service or representable batch request | **Not runnable** | Batch orchestration, per-record isolation, aggregate reconciliation, mixed SOP resolution, cases, approvals and evidence are absent. |

## Additional mandatory negative cases

| Case | Actual result | Assessment |
|---|---|---|
| Unclassified field blocks model invocation | `unknown_fields` raises `ValueError` before the nonexistent model stage | Core fail-close is executable; required error code and security event are absent. |
| Tokenized PII preserves calculation | Customer name becomes `tok_<hash>` while principal remains usable | Executable, but token is not typed, trace-bound or expiring. |
| LLM/deterministic mismatch | Query-supplied `llm_amount` unequal to engine result makes `CTRL-LLM-VAR-001` fail and status BLOCKED | Comparison works; no real LLM, variance detail, manual-review case or payment object. |
| SOP with SIN stays blocked | Detector finds the synthetic SIN and `may_activate` returns false | Predicate works; no guarded persisted ACTIVE transition exists. |
| Unauthorized approver denied | Standalone `authorize` helper raises `PermissionError` | Not integrated with an approval endpoint or state change. |
| Same user submits and approves | Standalone `enforce_sod` helper raises `PermissionError` | Not integrated with a persisted approval workflow; no `SOD_VIOLATION` event. |

## Test suite result

The existing suite completed with **11 passed**. It contains unit-level coverage for date selection, one known deterministic amount, split reconciliation, unclassified-field failure, tokenization, amount mismatch, static exact duplicate, SIN detection, RBAC helper denial, SoD helper denial and activation predicate behavior. It does not constitute end-to-end coverage of any complete governed RAG execution.
