# Decisions required

| ID | Decision | Recommendation | Owner | Blocking |
|---|---|---|---|---|
| ADR-IA-001 | Approve 14-stage lifecycle | Approve baseline | Platform Owner | Yes |
| ADR-IA-002 | Approve lifecycle-first primary navigation | Approve | Platform Owner | Yes |
| ADR-IA-003 | Editorial spelling | Canadian/British | Platform Owner + Content Lead | No |
| ADR-IA-004 | Career portfolio placement | Archive under About or separate corporate site | Platform Owner | No |
| ADR-IA-005 | Member access by methodology stage | Keep access policy separate from IA | Platform Owner | Yes for prototype |
| ADR-IA-006 | Canonical governance destination | Integrated Governance Model under Stage 4 | Methodology Lead | Yes |
| ADR-IA-007 | Canonical security-review destination | Stage 7 with assurance links to Stage 12 | Security + Architecture leads | Yes |
| ADR-IA-008 | Deliverable system of record | D1 metadata plus controlled R2 attachments | Technical Lead | Yes for Phase 1 |
| ADR-IA-009 | Preview environment/database | Dedicated Cloudflare preview resources | Technical Lead | Yes for Phase 1 |
| ADR-IA-010 | Production redirect timing | Only after destination acceptance | Platform Owner | No |
| ADR-IA-011 | Knowledge Discovery placement | Knowledge Centre search | Platform Owner | No |
| ADR-IA-012 | Phase 0 gate | Approve with conditions after review | Platform Owner | Yes |

## Assumptions

- Current deployable content lives in `greenfield-portal`; backup/work/package directories are not canonical sources.
- D1 remains the metadata store and R2 remains the controlled binary store.
- Current routes stay available throughout migration.
- No approval is inferred from the instruction to implement Phase 0.

