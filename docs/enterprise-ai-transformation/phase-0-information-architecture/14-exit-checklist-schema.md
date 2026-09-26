# 0.14 Standard exit-checklist schema

Each item records: stable ID, stage, requirement, rationale, criticality, applicability rule, evidence required, evidence link, validator, status, exception, exception approver, due date and validation date.

Statuses are `not-started`, `in-progress`, `met`, `not-met`, `not-applicable` and `exception-approved`.

Rules:

- Mandatory applicable items must be `met` or have an approved, unexpired exception.
- `Not applicable` requires rationale and validator.
- Conditional items expose their applicability rule.
- Recommended items do not block the gate but remain visible.
- Checklist completion does not itself approve the stage; it supplies gate evidence.

