# 0.15 Cross-link and traceability model

## Traceability chain

`ambition → outcome → capability → opportunity → business case → architecture decision → control → implementation mechanism → test → evidence → release → operational measure → realised benefit`

## Relationship rules

- Directional, typed links use stable IDs rather than titles or URLs.
- A page may have one primary stage and multiple related stages.
- Every governance control maps to an implementation mechanism, test, owner and evidence requirement.
- Every architecture component maps to implementation guidance, monitoring, ownership and failure handling.
- Every stage gate consumes deliverables and checklist evidence.
- Every benefit maps back to its baseline, owner and measurement method.
- Canonical concepts are linked, never redefined in lifecycle pages.
- Related-page blocks are derived from relationships rather than manually duplicated link lists.

## Validation

Detect orphan pages, broken IDs, duplicate canonical names, missing reverse relationships, control-to-implementation gaps, architecture-to-operations gaps, deliverables without gates and gates without approvers.

