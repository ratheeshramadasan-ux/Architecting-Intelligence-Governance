# Unified RR Bank AI Operations Architecture

## Platform concept

RR Bank AI Operations & Governance is a shared enterprise control-plane experience above independently maintained AI solutions. It provides one place to understand operational status, automation ownership, data contracts, sensitive-data policies, RAG posture, controls, approvals, security duties, and evidence. It does not combine solution business logic or imply that visual registry records are a production system of record.

## Solution boundaries

The shared shell lives at `/enterprise-architecture/ai-operations/`. It embeds or links to:

- `/enterprise-architecture/banking-agent-demo/` — Customer Banking Agent, which retains its customer UI, assistant, request execution, governance trace and approval demonstrations.
- `/enterprise-architecture/incentive-commission-demo/` — Incentive & Commission Processing, which retains its operations, governance, deterministic calculation and Phase 2 prototype assets.

The shell owns no customer banking or commission calculation logic. The solutions remain deployable and maintainable as separate code surfaces.

## Shared governance model

Every registered automation is represented with the same minimum control profile:

1. Authentication context
2. Active, versioned AI Data Contract
3. PII and sensitive-data policy
4. Approved model and purpose
5. Tool permissions
6. RAG policy when retrieval is used
7. Control set
8. Approval rules
9. Audit evidence requirements

RAG is capability-specific. It is optional and limited to approved policy knowledge for Customer Banking. It is mandatory for SOP interpretation in the target Commission architecture, while the current implementation is visibly identified as a partial local prototype because Vectorize and actual semantic retrieval are not connected.

## Routing

The portal's existing static asset behavior already serves nested `index.html` entrypoints. No Worker, Wrangler, shared navigation, or production route configuration was changed. Hash routes within the shell select cross-solution views. The solution views use same-origin iframe sources and also provide direct links to the original application routes.

## Data boundaries

- Customer/account data remains owned by the Banking Agent boundary.
- Dealer, transaction, commission, SOP and calculation data remains owned by the Commission boundary.
- Shared registry, status and audit rows in this Phase 3 shell are static synthetic demonstration records and are labelled accordingly.
- A production control plane should consume normalized read models or events from each solution, not query or duplicate transactional tables directly.
- No token-vault content, credentials, JWTs or chain-of-thought belongs in the shared shell or its evidence projection.

## Security boundaries

The browser shell is not an authorization boundary. Production authorization must be independently enforced by each solution API using server-derived identity and resource scope. Cross-solution governance APIs should use least-privilege service identities. Approval roles and segregation rules remain authoritative in the service that owns the business state. Embedding a solution must not grant access beyond the user's existing session.

Recommended production controls include explicit iframe `frame-ancestors`, CSP, same-site session policy, CSRF protection, authenticated registry APIs, output encoding, evidence redaction and immutable centralized security telemetry.

## Backend ownership

| Capability | Owning boundary |
|---|---|
| Customer requests, accounts, banker approvals | Customer Banking Agent backend |
| SOP ingestion, retrieval, commission calculation, controls, HITL | Incentive & Commission backend |
| Automation catalogue and shared governance read models | Future AI Operations control-plane service |
| Enterprise identity, role assignments and audit retention | Enterprise security/platform services |

The shell does not copy backend code from either solution and introduces no duplicate business API.

## Deployment model

Current delivery is local/static only. The new folder can be served by the same nested static asset route as the two demos. No production configuration or deployment command was used.

For a future non-production deployment, promote the shell as an independently versioned static asset, configure CSP for the two same-origin solution paths, and connect read-only governance aggregation endpoints. Production promotion requires separate authorization and should not be coupled to either solution's business release.

## Phase 3 integration changes

- Added only `greenfield-portal/enterprise-architecture/ai-operations/` and its documentation.
- Did not edit `banking-agent-demo`.
- Did not edit `incentive-commission-demo`.
- Did not edit shared portal routing, Worker, Wrangler, or deployment configuration.
