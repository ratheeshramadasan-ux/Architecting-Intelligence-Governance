# Unified AI Operations Walkthrough

## 1. Establish the operating model

Open `/enterprise-architecture/ai-operations/`. Point out the two active registered solutions and the common governance coverage strip. Clarify that dashboard activity is synthetic development data and that this is one operating platform, not a list of unrelated demos.

## 2. Compare solution boundaries

Open Customer Banking Agent from AI Solutions. The existing application loads inside the shared solution workspace; demonstrate customer interaction, live governed execution, request queue and banker approval behavior. Use “Open full workspace” to show that its original route remains intact.

Return to the control centre and open Incentive & Commission Processing. Demonstrate the operations dashboard, scenarios, exception queues and deterministic calculation evidence without moving its business logic into the shell.

## 3. Review the shared automation registry

Open Governance → Automation Registry. Compare ownership, type, model, risk, contract version, RAG posture, control set, security profile, approval and execution metadata for `AUTO-CBA-001` and `AUTO-ICP-002`.

## 4. Compare data contracts and privacy decisions

Open AI Data Contracts. Show that both solutions tokenize identity and block SIN, while only required business values are allowed. Then open PII & Sensitive Data to compare the common classification against per-automation handling.

## 5. Explain different RAG postures

Open RAG Governance. Customer Banking uses optional, policy-only retrieval; protected customer resources must come from authorized tools. Commission Processing requires governed SOP retrieval in its target state. Emphasize the visible “local prototype / Vectorize not connected” status from the completed Phase 2 audit.

## 6. Compare controls

Open Control Library. Contrast resource authorization, non-enumeration and banker thresholds with duplicate, anomaly, calculation variance, compliance, SOP-version and RAG-approval controls.

## 7. Demonstrate human accountability

Open Approval Policies, then Security → Access & Duties. Walk through the shared role model and the rule that a submitter cannot approve the same request. Approval is a human decision; controlled execution still revalidates state and controls in the owning solution.

## 8. Close with traceability

Open Audit → Evidence Explorer. Use the filter controls to explain the target cross-solution evidence model: automation, trace, user, date, control outcome, PII, approval and security event. All displayed rows are explicitly synthetic; no live event fabrication or production connection is implied.
