# Security and privacy controls

- Security context is created by the application and is never accepted from model output.
- Unknown fields and inactive data contracts fail closed before invocation.
- Default handling supports `ALLOW`, `TOKENIZE`, `MASK`, `GENERALIZE`, `BLOCK`, and `DERIVE`.
- Token rehydration requires an explicit authorization decision; vault values are excluded from traces.
- High or critical unresolved document findings prevent RAG activation.
- Original and sanitized documents are physically separate.
- Submitters cannot approve their own work; roles have narrow permissions.
- LLM output is advisory and schema constrained. Calculation and payment authorization are outside the model boundary.
- Traces record versioned automation, SOP, contract, model, chunks, calculation, controls, approvals, decision, trace ID, and evidence hash without chain-of-thought or secrets.

All names, identifiers, transactions, and financial records in this repository are synthetic.
