const fs = require("fs");
const path = require("path");
const { marked } = require("marked");
const { chromium } = require("playwright");

const repo = process.cwd();
const out = path.join(repo, "docs", "enterprise-ai-transformation", "phase-05-master-blueprint");
const diagrams = path.join(out, "diagrams");
fs.mkdirSync(diagrams, { recursive: true });

const stages = [
  ["0", "Mobilise", "Create the mandate, scope, sponsorship and programme controls.", "Programme Charter", "Mobilisation approved"],
  ["1", "Discover", "Establish an evidence-based current-state baseline.", "Current-State Discovery Baseline", "Discovery accepted"],
  ["2", "Assess Readiness", "Measure capability, evidence gaps and remediation priorities.", "Enterprise AI Readiness Assessment", "Readiness disposition approved"],
  ["3", "Define Strategy", "Agree ambition, outcomes, operating model and roadmap.", "Enterprise AI Strategy Decision Pack", "Strategy approved"],
  ["4", "Establish Governance", "Put decision rights, policies, controls and assurance in place.", "Governance and Control Framework", "Governance approved"],
  ["5", "Identify and Prioritise Opportunities", "Create and balance a governed opportunity portfolio.", "Prioritised Opportunity Portfolio", "Portfolio approved"],
  ["6", "Build the Business Case", "Make benefits, costs, assumptions and funding transparent.", "Enterprise AI Business Case", "Investment approved"],
  ["7", "Design the Target Architecture", "Turn strategy and controls into an implementable target state.", "Target Architecture Decision Pack", "Architecture approved"],
  ["8", "Plan Implementation", "Create the integrated delivery, change, test and transition plan.", "Integrated Implementation Plan", "Plan approved"],
  ["9", "Build and Integrate", "Configure, integrate and document the governed solution.", "Build and Configuration Evidence", "Build completion approved"],
  ["10", "Test and Validate", "Prove functional, AI, security, control and operational quality.", "Production Readiness Evidence Pack", "Release candidate accepted"],
  ["11", "Deploy and Transition", "Cut over safely and transfer accountable ownership.", "Transition and Ownership Record", "Production release approved"],
  ["12", "Operate and Govern Production", "Run, monitor, assure and respond throughout service life.", "Production Assurance Report", "Continued operation approved"],
  ["13", "Improve and Scale", "Measure value, improve performance and scale reusable capability.", "Benefits and Scale Decision Pack", "Scale decision approved"]
];

const capabilities = [
  "Executive Leadership","Business and Process","Programme Delivery","Governance and Responsible AI",
  "Risk and Compliance","Security","Identity","Privacy and Legal","Enterprise Architecture",
  "Infrastructure and Cloud","AI Platforms and Models","Automation","Data and Knowledge",
  "Integration","Operations and Reliability","People, Change and Training","Finance and Procurement",
  "Vendor Management","Audit and Assurance","Benefits and Value"
];

const roles = [
  ["Executive Sponsor","Mandate, investment and executive risk acceptance","0, 3, 6, 11, 13"],
  ["Platform Owner","Methodology, platform roadmap and final acceptance","All stages"],
  ["Programme Director","Integrated transformation delivery","0-11"],
  ["Business Owner","Outcomes, adoption and benefits","0, 1, 3, 5, 6, 10-13"],
  ["Enterprise Architect","Target state and enterprise alignment","1-10, 12-13"],
  ["Data Owner","Data purpose, quality, access and lifecycle","1-13"],
  ["Security Lead","Security risk, architecture and control validation","1-12"],
  ["Privacy and Legal Leads","Lawful use, rights, contracts and obligations","1-12"],
  ["Engineering Lead","Build, integration and technical quality","7-11"],
  ["Service Owner","Production readiness, service levels and lifecycle","8-13"],
  ["Audit and Assurance Lead","Independent evidence and control assurance","4, 10, 12-13"]
];

const information = [
  ["Business drivers and objectives","Explain why change is required","Executive Sponsor","Programme Lead","Business Owner","Executive Sponsor","Mandate and strategy","0","Charter; strategy; benefits"],
  ["Stakeholders and decision rights","Establish ownership and engagement","Programme Director","Programme Office","Methodology Lead","Executive Sponsor","Approved register and RACI","0","All stage gates"],
  ["Business capabilities and processes","Locate value and operational impact","Business Owner","Business Analysts","Enterprise Architect","Business Owner","Capability/process maps","1","Opportunities; architecture; change"],
  ["Applications, integrations and technology","Identify constraints and dependencies","CIO/CTO","Architecture Team","Enterprise Architect","CTO","Current-state repository","1","Readiness; architecture; cost"],
  ["Data inventory, quality and classification","Determine lawful, reliable AI inputs","Data Owner","Data Stewards","Security/Privacy","Data Owner","Data catalogue evidence","1","Readiness; design; testing; operations"],
  ["AI and automation use cases","Expose current adoption and shadow AI","Business Owners","Discovery Team","Risk Lead","Programme Director","Use-case inventory","1","Governance; opportunity portfolio"],
  ["Readiness scores and gaps","Make remediation evidence-based","Capability Owners","Assessment Team","Assurance Lead","Programme Board","Assessment evidence","2","Strategy; roadmap; business case"],
  ["Risk appetite and control requirements","Set automation and risk boundaries","Risk Executive","Risk Team","Legal/Security","Risk Executive","Approved policy and controls","0-4","Architecture; testing; operations"],
  ["Benefit baseline and cost assumptions","Make value measurable","Finance/Business Owner","Finance Analysts","Finance Lead","Executive Sponsor","Approved baseline","6","Funding; operations; scaling"],
  ["Architecture decisions","Preserve rationale and consequences","Enterprise Architect","Architecture Team","Security/Data/Ops","Architecture Review Board","ADRs and models","7","Build; test; operations"],
  ["Test and evaluation evidence","Prove quality and control operation","Engineering Lead","Test Teams","Independent Validators","Release Authority","Signed evidence pack","10","Deployment; assurance"],
  ["Operational measures and incidents","Control live service and improve it","Service Owner","Operations","Assurance Lead","Platform Owner","Logs, reports, incident records","12","Benefits; improvement; scaling"]
];

const workshops = [
  ["Executive ambition and mandate","Agree need, outcomes, sponsorship and boundaries","Executive Sponsor; CIO/CTO; Business Owners","Methodology Lead","Business context and constraints","Drivers; outcomes; scope; appetite","Mandate and draft charter","Yes","3 hours","Charter; principles"],
  ["Stakeholder and governance design","Assign forums, rights and evidence responsibilities","Programme; Risk; Security; Data; Legal; Audit","Programme Director","Draft charter and organisation model","Who decides, validates, approves and accepts risk?","Stakeholder register; RACI; forum map","Yes","4 hours","Charter; RACI"],
  ["Enterprise discovery","Create the current-state evidence plan","Business; Architecture; Data; Security; Operations","Enterprise Architect","Inventory sources and prior assessments","What exists, who owns it, how reliable is it?","Discovery plan and evidence requests","No","1 day","Discovery baseline"],
  ["Readiness calibration","Validate scores, gaps and remediation","Capability owners; Assurance; Programme","Methodology Lead","Draft readiness scores","What evidence supports each score?","Approved readiness assessment","Yes","4 hours","Readiness assessment"],
  ["Strategy choices","Select ambition, operating model and roadmap","Executives; Business; Architecture; Finance; Risk","Methodology Lead","Discovery and readiness outputs","What will we do, not do, and fund?","Strategy decision pack","Yes","1 day","Strategy; roadmap"],
  ["Governance and risk design","Define policies, controls and approval thresholds","Risk; Legal; Privacy; Security; Data; Audit","Governance Lead","Strategy and risk appetite","Which decisions require which evidence and authority?","Governance framework","Yes","1 day","Policies; controls; gates"],
  ["Opportunity portfolio","Compare problems, feasibility, risk, value and dependencies","Business Owners; Data; Technology; Finance; Risk","Portfolio Lead","Use-case inventory and criteria","Which problems deserve investment now?","Prioritised portfolio","Yes","1 day","Intake; scoring; roadmap"],
  ["Architecture decisions","Agree target state, alternatives and exceptions","Architecture; Engineering; Security; Data; Operations","Enterprise Architect","Approved requirements and controls","How will the system meet outcomes and controls?","Architecture decision pack","Yes","1-2 days","Architecture; ADRs"],
  ["Production readiness","Review tests, controls, support and rollback","Release Authority; Engineering; Security; Operations; Business","Service Owner","Completed evidence pack","Can the service operate safely and recover?","Gate decision and conditions","Yes","4 hours","Readiness pack; cutover"],
  ["Benefits and scale review","Compare outcomes with the approved case","Sponsor; Business; Finance; Operations; Risk","Business Owner","Operational and benefits data","What value was realised and what should scale?","Benefits and scale decision","Yes","4 hours","Benefits review"]
];

const decisions = [
  ["Mandate and scope","Methodology Lead","Programme Board","Executive Sponsor","Executive Sponsor","Programme Office"],
  ["Funding","Business Owner and Finance","Architecture, Risk, Procurement","Executive Sponsor","Executive Sponsor","Finance"],
  ["Risk appetite and exceptions","Risk Lead","Security, Privacy, Legal, Business","Risk Executive","Risk Executive","Risk Office"],
  ["Architecture","Enterprise Architect","Security, Data, Engineering, Operations","Architecture Review Board","Business/Risk authority for exceptions","Architecture Repository"],
  ["Technology and vendor","Architecture and Procurement","Security, Legal, Finance, Data","CTO/CIO authority","Business/Risk authority","Procurement"],
  ["Data use","Data Owner","Privacy, Security, Legal","Data Owner","Risk/Privacy authority","Data Governance"],
  ["Production release","Service Owner","Engineering, Security, Business, Operations","Release Authority","Business/Risk authority","Change Management"],
  ["Continued operation","Service Owner","Assurance, Risk, Business, Vendor","Platform Owner","Risk Executive","Service Management"],
  ["Scale or retire","Business Owner","Finance, Operations, Risk, Architecture","Executive Sponsor","Executive Sponsor","Portfolio Office"]
];

const dashboards = [
  ["Executive","Outcome progress; investment; realised value; top risks","Gate decisions; funding; risk acceptance","Stage progress; benefits; critical exceptions"],
  ["Programme","Milestones; dependencies; RAID; resource demand","Stage gates; overdue evidence","Deliverable completion; schedule; blockers"],
  ["Architecture","Decision status; standards; technical debt; exceptions","ADRs; architecture approvals","Coverage; exceptions; resilience readiness"],
  ["Governance","Control coverage; reviews; exceptions; incidents","Policy and risk decisions","Control effectiveness; overdue reviews"],
  ["Operations","Availability; latency; quality; drift; cost; incidents","Change and continued-operation approvals","SLOs; evaluation trends; capacity"],
  ["Benefits","Baseline; target; realised benefit; adoption; unit economics","Scale, optimise or retire","Benefit variance; adoption; TCO"]
];

const personas = [
  ["Executive Sponsor","0, 3, 6, 11, 13","Mandate, strategy, business case, gate summaries","Charter; decision packs","Executive and Benefits"],
  ["Programme Manager","All","Stage plans, dependencies, RACI, checklists","Plans; RAID; gate packs","Programme"],
  ["Business Owner","0-6, 10-13","Capabilities, opportunities, outcomes, adoption","Intake; business case; benefits","Executive; Benefits"],
  ["Enterprise Architect","1-10, 12-13","Current state, requirements, target state, ADRs","Architecture pack; review checklist","Architecture"],
  ["Security Lead","1-12","Threats, controls, evidence, incidents","Security review; test evidence","Governance; Operations"],
  ["Data Lead","1-13","Inventory, quality, classification, lineage, monitoring","Data assessment; design; controls","Architecture; Governance"],
  ["Operations Lead","7-13","SLOs, telemetry, resilience, support, incidents","Runbooks; readiness; assurance","Operations"],
  ["Audit and Assurance","2, 4, 10, 12-13","Control design, evidence, exceptions, independent results","Assurance reports","Governance"]
];

const assistants = [
  ["Charter assistant","0","Draft a charter from approved mandate inputs","Mandate, scope, outcomes, roles","Draft only; sponsor approval required"],
  ["Stakeholder and RACI assistant","0","Suggest stakeholders and responsibility assignments","Organisation, decisions, deliverables","Owner validation; exactly one accountable role"],
  ["Discovery question assistant","1","Tailor evidence questions by capability","Scope, sector, current systems","No invented current-state facts"],
  ["Readiness assessment assistant","2","Explain scores and missing evidence","Assessment responses and evidence","Cannot approve its own score"],
  ["Strategy assistant","3","Compare options and draft decision narrative","Discovery, readiness, ambition","Label assumptions and alternatives"],
  ["Governance assistant","4","Map risks to controls, owners and evidence","Risk classification and policy","Human approval for policy and risk acceptance"],
  ["Opportunity assistant","5","Structure problems and compare opportunities","Intake and evidence","No false precision in scores or value"],
  ["Business-case assistant","6","Build scenarios and sensitivity analysis","Baselines, assumptions, costs","Ranges and confidence required"],
  ["Architecture review assistant","7","Check traceability and missing controls","Requirements, decisions, diagrams","Architect and control-owner review"],
  ["Implementation assistant","8-9","Draft plans, work packages and evidence lists","Approved architecture and controls","No production changes"],
  ["Validation assistant","10","Generate test cases and evidence summaries","Requirements, controls, build version","Independent validation retained"],
  ["Operations assistant","11-13","Explain telemetry, incidents and improvement options","Approved operational data","No autonomous high-impact action"]
];

const table = (headers, rows) => `| ${headers.join(" | ")} |\n|${headers.map(()=> "---").join("|")}|\n${rows.map(r=>`| ${r.join(" | ")} |`).join("\n")}`;
const stageTable = table(["Stage","Why it exists","Primary output","Gate"], stages.map(s=>[`${s[0]} — ${s[1]}`,s[2],s[3],s[4]]));
const capabilityList = capabilities.map((c,i)=>`${i+1}. **${c}.** Owns a coherent set of skills, decisions, pages and deliverables; it participates across stages rather than becoming a competing lifecycle.`).join("\n");

const markdown = `---
title: Enterprise AI Transformation Blueprint
version: 0.1.0
status: Proposed governing baseline - Platform Owner approval required
date: 2026-07-27
phase: "0.5"
---

# Enterprise AI Transformation Blueprint

> **Governing purpose:** explain how an organisation moves from AI ambition to governed, secure, measurable enterprise value. This blueprint integrates the Phase 0 information architecture; it does not redesign it.

**Document owner:** Platform Owner  
**Methodology owner:** Enterprise AI Methodology Lead  
**Change control:** no future structure, menu, deliverable or workflow may conflict with this blueprint without an approved change record.  
**Production status:** non-production design artifact; no deployment or route change is authorised.

## How to read this blueprint

The lifecycle is the primary journey. Capabilities supply expertise. Information becomes governed deliverables. Deliverables support decisions. Decisions release the next stage. Knowledge articles explain reusable concepts without replacing the methodology. AI assistance accelerates drafting and analysis but never assumes authority.

![Enterprise transformation lifecycle](diagrams/01-lifecycle.svg)

# Part 1 — Executive Vision

Architecting AI is a complete Enterprise AI Transformation Methodology. It helps leaders and delivery teams turn an initial business need into an operated capability with accountable decisions, evidence, controls and measurable benefits.

The problem is rarely a lack of AI ideas. Organisations struggle because strategy, governance, data, security, architecture, delivery, operations and value measurement are treated as separate projects. The platform connects them through one lifecycle and one language.

It serves executives, business owners, programme leaders, architects, data and engineering teams, security, privacy, legal, risk, procurement, finance, operations, change, audit and learners. Its differentiator is traceability: a stated objective must remain connected to capability, process, data, opportunity, investment, architecture, implementation, control evidence and realised benefit.

# Part 2 — Transformation Story

A transformation begins with a business need: improve service, manage risk, grow capacity, reduce friction or create a new capability. Stage 0 converts that need into mandate and accountable scope. Stage 1 collects the current-state evidence. Stage 2 determines whether the organisation is ready and what must be remediated. Stage 3 turns ambition into choices and a roadmap.

Stage 4 establishes the rules and decision rights before opportunity selection becomes investment pressure. Stage 5 chooses problems worth solving. Stage 6 tests whether the expected value justifies cost and risk. Stage 7 designs the target state. Stage 8 builds an executable plan. Stage 9 implements it. Stage 10 proves it.

Stage 11 releases and transfers ownership. Stage 12 operates and governs the live service. Stage 13 compares actual results with the approved case, then improves, scales or retires the capability. Its evidence becomes new discovery input, making transformation a managed learning cycle.

# Part 3 — Complete Enterprise Lifecycle

${stageTable}

**Dependency rule:** each gate accepts the previous stage’s evidence and authorises the next commitment. A stage may iterate backward when evidence changes; it may not silently bypass a mandatory gate.

# Part 4 — Enterprise Capability Model

![Enterprise capability map](diagrams/02-capability-map.svg)

${capabilityList}

Every future article has one primary capability, one primary lifecycle location or Knowledge Centre classification, and typed relationships to other capabilities. Capability ownership does not duplicate lifecycle content.

# Part 5 — Enterprise Knowledge Graph

![Enterprise knowledge graph](diagrams/03-knowledge-graph.svg)

The graph uses stable objects and directional relationships: objectives **drive** capabilities; deliverables **provide evidence to** gates; controls are **implemented by** mechanisms and **verified by** tests; architecture decisions **constrain** implementation; operational measures **validate** benefits.

Minimum object types are stage, capability, page, concept, role, information element, workshop, deliverable, template, decision, gate, checklist item, architecture component, control, test, evidence, measure and benefit.

No published object may be orphaned. Canonical concepts have one definition. Lifecycle pages reference them. Relationships are versioned, reviewed and validated before publication.

# Part 6 — Business Capability Traceability

![Business-to-value traceability](diagrams/04-business-traceability.svg)

The traceability record begins with a uniquely identified objective and ends with a measured benefit. Each link records owner, source, version and confidence. A proposed AI opportunity without a capability and process is incomplete. A benefit without a baseline and owner is not measurable. An implementation without approved architecture and controls is not production-ready.

# Part 7 — Information Collection Blueprint

${table(["Information","Purpose","Owner","Collector","Validator","Approver","Evidence","Stage","Used by"], information)}

Information is collected once from the best available source, assigned an owner and reused by reference. A later stage may validate or enrich it; it must not create an independent conflicting copy. Sensitive information carries classification, access, retention and lawful-use metadata.

# Part 8 — Workshop Blueprint

${table(["Workshop","Purpose","Participants","Facilitator","Preparation","Key question","Output","Approval","Duration","Related"], workshops)}

Workshops are decision and evidence mechanisms, not calendar events. A workshop is complete only when outputs, open questions, owners and approval requirements are recorded.

![Workshop map](diagrams/05-workshop-map.svg)

# Part 9 — Enterprise Deliverable Graph

![Deliverable dependency graph](diagrams/06-deliverable-graph.svg)

Every deliverable has a stable ID, purpose, stage, workstream, owner, author, validator, approver, inputs, acceptance criteria, evidence, classification, status, review date and gate. A file attachment is not the deliverable record.

The critical chain is Charter → Discovery Baseline → Readiness Assessment → Strategy → Governance Framework → Opportunity Portfolio → Business Case → Target Architecture → Implementation Plan → Build Evidence → Readiness Evidence → Transition Record → Production Assurance → Benefits and Scale Decision.

# Part 10 — Role Blueprint

${table(["Role","Accountability and decision rights","Lifecycle participation"], roles)}

Each activity has exactly one accountable role and at least one responsible role. Authors do not approve their own high-risk evidence. Role pages show responsibilities, approvals, deliverables, workshops, stage participation, decision rights and related guidance.

![Role interaction map](diagrams/07-role-map.svg)

# Part 11 — Decision Blueprint

${table(["Decision","Recommends","Reviews","Approves","Accepts risk","Records"], decisions)}

Every decision records question, options, recommendation, evidence, assumptions, risks, conditions, rationale, signatories, expiry and next action. Allowed gate outcomes are Approved, Approved with conditions, Rework required, Deferred and Rejected.

# Part 12 — Enterprise Dashboard Blueprint

${table(["Dashboard","KPIs and status","Approvals and risks","Primary views"], dashboards)}

Dashboards report from canonical deliverable, gate, control, operational and benefits records. They do not create a second status system. Every metric shows definition, owner, source, cadence, threshold, last refresh and confidence.

![Dashboard wireframes](diagrams/08-dashboard-wireframes.svg)

# Part 13 — Persona Blueprint

${table(["Persona","Relevant stages","Pages and guidance","Templates and deliverables","Dashboards"], personas)}

Persona views filter the same canonical objects. They never fork content. A user can move from persona view to lifecycle or capability view without losing object identity.

# Part 14 — Navigation Blueprint

![Navigation map](diagrams/09-navigation-map.svg)

Primary navigation is Home, Enterprise AI Transformation, Lifecycle, Knowledge Centre, Deliverables, Tools and About. Desktop uses a lifecycle panel; tablet and mobile use an accessible stage accordion. Stage pages include breadcrumbs, persistent lifecycle position, stage-local navigation, related deliverables and previous/next controls.

Role, capability, knowledge, template and deliverable views are alternate indexes over canonical objects. They do not become parallel taxonomies. Navigation supports keyboard operation, screen readers, visible focus, clear current stage/page, reduced motion and touch targets.

# Part 15 — Search Blueprint

![Intent-aware search map](diagrams/10-search-map.svg)

Search understands journey intent before ranking content. “I want to start AI” resolves to the Mobilise stage, charter, business drivers, stakeholder model and workshops. “Can this go live?” resolves to validation evidence, production readiness, cutover, rollback and release authority.

The pipeline is query → intent and persona → lifecycle stage → capability and object filters → access/version filters → hybrid retrieval → evidence reranking → grounded response → related next actions. Answers disclose evidence, source date, confidence and gaps. When evidence is insufficient, search says so.

# Part 16 — Knowledge Centre Blueprint

The Knowledge Centre contains canonical concepts, patterns, standards, FAQs, concerns, decisions, sources and progressive explanations. It supports the methodology by answering “what is this?” and “how does it work?” Lifecycle guidance answers “why now?”, “what must we do?”, “who decides?” and “what evidence unlocks the next stage?”

Canonical knowledge is reusable across stages through typed links. Glossary aliases, acronyms and deprecated terms resolve to one definition. Vendor claims and time-sensitive facts carry sources and review dates.

# Part 17 — Deliverable Repository Blueprint

Deliverables are browsable by stage, role, capability, audience, type, criticality, status and gate. Each record has one canonical source and controlled attachments. Templates instantiate deliverables but remain independently versioned.

Repository views expose dependencies, missing evidence, approvers, exceptions, review dates and downstream impact. Access controls apply to metadata and files. Approved records are immutable; revisions create new versions.

# Part 18 — Implementation Blueprint

1. **Phase 1 — Methodology foundation.** Implement metadata, lifecycle navigation, canonical routes, reusable page structures and Stage 0 vertical slice. Success: accessible preview, no current-route removal, approved taxonomy validation.
2. **Phase 2 — Evidence and deliverables.** Build deliverable repository, templates, RACI, gates, checklists and Stage 1-4 content. Success: traceable evidence flow and reviewable gates.
3. **Phase 3 — Investment to implementation.** Build Stage 5-11, workshops, architecture repository, assessment tools and dashboards. Success: one opportunity traced through release.
4. **Phase 4 — Production intelligence.** Build Stage 12-13, operational measures, benefits, assurance, knowledge graph validation and intent-aware hybrid search. Success: live-service evidence supports continue/improve/retire decisions.
5. **Phase 5 — Governed AI assistance and scale.** Add generation workflows, progressive visuals, integrations and governance automation. Success: assistance is grounded, access-controlled, auditable and human-approved where required.

Each phase uses preview resources, migration rehearsal, accessibility and security testing, route compatibility and a documented rollback. Production requires separate approval.

# Part 19 — Enterprise AI Assistant Blueprint

${table(["Assistant","Stage","Purpose","Required context","Guardrail"], assistants)}

Every assistant action displays purpose, inputs, sources, assumptions, missing evidence, generated status and required human decision. Generated artifacts begin as drafts. The assistant cannot approve its own output, accept risk, release production or fabricate unavailable enterprise facts.

# Part 20 — Future Platform Vision

**One year:** lifecycle foundation, Stage 0-11 vertical path, canonical deliverables, preview dashboards, grounded search and controlled templates.

**Three years:** complete operating lifecycle, evidence automation, knowledge graph, enterprise integrations, interactive assessments, progressive visual learning, benefits analytics and governed copilots.

**Five years:** federated enterprise architecture and governance repository, continuous control evidence, workflow orchestration, scenario intelligence, cross-sector overlays and measurable learning across transformations.

The long-term platform remains anchored to the same rule: business outcomes, decisions, architecture, controls, implementation evidence, operations and benefits stay connected.

# Governance of this blueprint

Proposed status remains **Rework required pending Platform Owner approval**, consistent with the Phase 0 gate. Changes require a change record containing reason, affected objects, traceability impact, migration impact, owner, reviewers, decision and effective version.

## Source pack

This blueprint integrates the Phase 0 inventory, information architecture, menu hierarchy, migration matrix, taxonomy, overlap and gap registers, naming register, page standards, deliverable/RACI/gate/checklist schemas, cross-link model, URL strategy, navigation behavior and implementation plan located in \`../phase-0-information-architecture/\`.
`;

function svgDoc(title, subtitle, body, height=800) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="${height}" viewBox="0 0 1400 ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${title}</title><desc id="desc">${subtitle}</desc>
  <defs><filter id="s"><feDropShadow dx="0" dy="4" stdDeviation="7" flood-opacity=".12"/></filter>
  <style>.bg{fill:#f4f7fa}.title{font:700 34px Arial;fill:#08264a}.sub{font:16px Arial;fill:#506779}.box{fill:#fff;stroke:#cfd9e2;stroke-width:2;filter:url(#s)}.navy{fill:#08264a}.gold{fill:#c3912f}.teal{fill:#2b6f72}.h{font:700 17px Arial;fill:#08264a}.w{font:700 16px Arial;fill:#fff}.p{font:14px Arial;fill:#506779}.line{stroke:#8fa4b5;stroke-width:3;fill:none;marker-end:url(#a)}.thin{stroke:#b9c7d2;stroke-width:2;fill:none}</style>
  <marker id="a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8z" fill="#8fa4b5"/></marker></defs>
  <rect class="bg" width="1400" height="${height}"/><text class="title" x="60" y="58">${title}</text><text class="sub" x="60" y="88">${subtitle}</text>${body}</svg>`;
}
const esc = s => String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
const box = (x,y,w,h,title,sub="",cls="box") => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/><text class="${cls==='navy'||cls==='teal'?'w':'h'}" x="${x+16}" y="${y+28}">${esc(title)}</text>${sub?`<text class="${cls==='navy'||cls==='teal'?'w':'p'}" x="${x+16}" y="${y+51}">${esc(sub)}</text>`:""}`;

const lifecycleBody = stages.map((s,i)=>{
  const col=i%5,row=Math.floor(i/5),x=55+col*268,y=130+row*190;
  const arrow=i<stages.length-1 && col<4?`<path class="line" d="M${x+235} ${y+55}H${x+262}"/>`:"";
  return box(x,y,235,112,`Stage ${s[0]} — ${s[1]}`,s[3],i===0||i===13?"teal":"box")+arrow;
}).join("")+`<path class="line" d="M1240 620 C1325 690 1325 735 1180 735 H160 C55 735 45 640 70 625"/>`;

const capBody = capabilities.map((c,i)=>{
  const col=i%4,row=Math.floor(i/4),x=55+col*335,y=125+row*125;
  return box(x,y,300,82,c,"Cross-stage capability",i<4?"navy":"box");
}).join("");

const graphNodes = ["Business Need","Programme Charter","Discovery Baseline","Readiness","AI Strategy","Governance","Opportunity Portfolio","Business Case","Architecture","Implementation","Production","Measured Benefits"];
const graphBody = graphNodes.map((n,i)=>{
  const col=i%4,row=Math.floor(i/4),x=60+col*335,y=135+row*190;
  return box(x,y,270,85,n,"creates evidence for",i===0||i===11?"teal":"box")+(i<graphNodes.length-1&&col<3?`<path class="line" d="M${x+270} ${y+43}H${x+328}"/>`:"");
}).join("");

const trace = ["Business Objective","Capability","Process","Application","Data","Technology","AI Opportunity","Business Case","Architecture","Implementation","Benefits"];
const traceBody = trace.map((n,i)=>{
  const x=i<6?50+i*225:50+(i-6)*270,y=i<6?150:390,w=i<6?190:235;
  return box(x,y,w,78,n,i===10?"Measured outcome":"traceable object",i===0||i===10?"teal":"box")+(i<5||i>=6&&i<10?`<path class="line" d="M${x+w} ${y+39}H${x+w+30}"/>`:"");
}).join("")+`<path class="line" d="M1275 228 C1350 265 1350 350 65 385"/>`;

const workshopBody = workshops.map((w,i)=>{
  const x=60+(i%5)*268,y=135+Math.floor(i/5)*260;
  return box(x,y,235,140,w[0],`${w[8]} • ${w[6]}`,i===0||i===9?"teal":"box");
}).join("");

const delBody = stages.map((s,i)=>{
  const col=i%7,row=Math.floor(i/7),x=45+col*193,y=145+row*250;
  return box(x,y,168,118,`D${s[0]}`,s[3].length>23?s[3].slice(0,22)+"…":s[3],i===0||i===13?"teal":"box")+(i<stages.length-1&&col<6?`<path class="line" d="M${x+168} ${y+59}H${x+190}"/>`:"");
}).join("");

const roleBody = roles.map((r,i)=>{
  const col=i%4,row=Math.floor(i/4),x=55+col*335,y=130+row*195;
  return box(x,y,300,125,r[0],r[2],i<2?"navy":"box");
}).join("")+`<circle cx="700" cy="690" r="65" class="teal"/><text class="w" x="638" y="684">Evidence and</text><text class="w" x="636" y="707">decision model</text>`;

const dashboardBody = dashboards.map((d,i)=>{
  const col=i%3,row=Math.floor(i/3),x=55+col*445,y=130+row*300;
  return `<rect class="box" x="${x}" y="${y}" width="405" height="250" rx="12"/><rect class="navy" x="${x}" y="${y}" width="405" height="46" rx="12"/><text class="w" x="${x+18}" y="${y+30}">${d[0]} Dashboard</text>
  <rect fill="#eaf4f3" x="${x+18}" y="${y+66}" width="112" height="72" rx="8"/><rect fill="#f8f0df" x="${x+146}" y="${y+66}" width="112" height="72" rx="8"/><rect fill="#eef3f7" x="${x+274}" y="${y+66}" width="112" height="72" rx="8"/>
  <text class="h" x="${x+30}" y="${y+95}">KPI</text><text class="h" x="${x+160}" y="${y+95}">Gate</text><text class="h" x="${x+286}" y="${y+95}">Risk</text>
  <path class="thin" d="M${x+20} ${y+180} C${x+100} ${y+125},${x+180} ${y+215},${x+255} ${y+160} S${x+360} ${y+145},${x+385} ${y+195}"/></svg>`.replace("</svg>","");
}).join("");

const navBody = box(520,120,360,80,"Primary Navigation","Lifecycle is the main journey","navy")+
  ["Transformation","Lifecycle","Knowledge Centre","Deliverables","Tools","About"].map((n,i)=>box(55+i*225,285,190,82,n,i===1?"Stage sequence":"Canonical view",i===1?"teal":"box")).join("")+
  `<path class="line" d="M700 200V270"/><path class="thin" d="M150 265H1250"/>`+
  box(230,490,250,95,"Desktop","Lifecycle panel") + box(575,490,250,95,"Tablet / Mobile","Accessible accordion") + box(920,490,250,95,"Page Context","Breadcrumb + previous/next");

const searchBody = ["Question","Intent + Persona","Stage + Capability","Access + Version","Hybrid Retrieval","Evidence Reranking","Grounded Answer","Next Actions"].map((n,i)=>{
  const x=40+i*168;
  return box(x,250,145,100,n,i===6?"Sources + gaps":"",i===0||i===6?"teal":"box")+(i<7?`<path class="line" d="M${x+145} 300H${x+164}"/>`:"");
}).join("")+box(430,500,540,100,"Example: “I want to start AI”","Mobilise → Charter → Drivers → Stakeholders → Workshops","navy");

const diagramFiles = [
  ["01-lifecycle.svg",svgDoc("Enterprise AI Transformation Lifecycle","A gated, evidence-led journey from mandate to measurable value.",lifecycleBody,820)],
  ["02-capability-map.svg",svgDoc("Enterprise Capability Model","Capabilities contribute expertise across the lifecycle without duplicating it.",capBody,820)],
  ["03-knowledge-graph.svg",svgDoc("Enterprise Knowledge Graph","Every object is connected by a typed, reviewable relationship.",graphBody,750)],
  ["04-business-traceability.svg",svgDoc("Business-to-Value Traceability","Business intent remains connected through implementation to measured benefit.",traceBody,620)],
  ["05-workshop-map.svg",svgDoc("Enterprise Workshop Map","Workshops produce evidence and decisions at lifecycle transitions.",workshopBody,720)],
  ["06-deliverable-graph.svg",svgDoc("Enterprise Deliverable Dependency Graph","Each approved output becomes governed input to the next commitment.",delBody,690)],
  ["07-role-map.svg",svgDoc("Enterprise Role Map","Roles contribute, validate, approve and operate through one evidence model.",roleBody,820)],
  ["08-dashboard-wireframes.svg",svgDoc("Enterprise Dashboard Wireframes","Six views over one canonical status and evidence model.",dashboardBody,760)],
  ["09-navigation-map.svg",svgDoc("Navigation Blueprint","Lifecycle first; alternate views preserve canonical identity.",navBody,700)],
  ["10-search-map.svg",svgDoc("Intent-Aware Search Blueprint","Questions resolve to journey intent, evidence and next actions.",searchBody,680)]
];
for (const [name, content] of diagramFiles) fs.writeFileSync(path.join(diagrams,name),content);

const mdPath = path.join(out, "Enterprise AI Transformation Blueprint.md");
fs.writeFileSync(mdPath, markdown);

marked.setOptions({ gfm: true, headerIds: true });
const htmlBody = marked.parse(markdown.replace(/^---[\s\S]*?---\s*/,""));
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Enterprise AI Transformation Blueprint</title>
<style>
@page{size:Letter;margin:18mm 16mm 18mm}@page:first{margin-top:14mm}
:root{--navy:#08264a;--gold:#c3912f;--teal:#2b6f72;--ink:#1d2e3d;--muted:#526779;--line:#d5dfe7;--pale:#f4f7fa}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font:15px/1.62 Arial,sans-serif;color:var(--ink);background:#eef3f7}
main{max-width:1100px;margin:auto;padding:56px 68px 100px;background:#fff;box-shadow:0 12px 50px rgba(8,38,74,.12)}
h1,h2,h3{color:var(--navy);line-height:1.18;break-after:avoid}h1{margin:0 0 22px;font:700 42px/1.08 Georgia,serif;border-bottom:5px solid var(--gold);padding-bottom:18px}h2{margin-top:56px;font:700 29px/1.15 Georgia,serif;border-bottom:1px solid var(--line);padding-bottom:8px}h3{font-size:19px}
p,li{orphans:3;widows:3}blockquote{margin:25px 0;padding:18px 22px;border-left:5px solid var(--teal);background:#eaf4f3;color:#244f52}
table{width:100%;border-collapse:collapse;margin:20px 0 28px;font-size:12px;break-inside:auto}thead{display:table-header-group}tr{break-inside:avoid}th{background:var(--navy);color:#fff;text-align:left}th,td{padding:9px 10px;border:1px solid var(--line);vertical-align:top}tbody tr:nth-child(even){background:var(--pale)}
img{display:block;width:100%;height:auto;margin:25px auto 34px;break-inside:avoid;border:1px solid var(--line)}code{background:var(--pale);padding:2px 4px}a{color:#145f80}
body>header{display:none}.cover{min-height:88vh;display:flex;flex-direction:column;justify-content:center}.meta{color:var(--muted)}
@media print{body{background:#fff}main{max-width:none;padding:0;box-shadow:none}main>h1:not(:first-child){break-before:page}h1{font-size:34px}h2{break-before:auto;margin-top:36px}a{text-decoration:none;color:inherit}img{max-height:620px}table{font-size:9px}p,li{font-size:10.5px}blockquote{font-size:11px}}
@media(max-width:760px){main{padding:30px 18px}h1{font-size:34px}table{display:block;overflow:auto}}
</style></head><body><main>${htmlBody}</main></body></html>`;
const htmlPath = path.join(out, "Enterprise AI Transformation Blueprint.html");
fs.writeFileSync(htmlPath, html);

(async()=>{
  const browser = await chromium.launch({
    headless:true,
    executablePath:"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  });
  const page = await browser.newPage({ viewport:{ width:1280,height:900 } });
  await page.goto(`file:///${htmlPath.replaceAll("\\","/")}`,{waitUntil:"networkidle"});
  await page.emulateMedia({media:"print"});
  await page.pdf({path:path.join(out,"Enterprise AI Transformation Blueprint.pdf"),format:"Letter",printBackground:true,displayHeaderFooter:true,
    headerTemplate:'<div style="font:8px Arial;color:#65788a;width:100%;padding:0 16mm">Architecting AI • Enterprise AI Transformation Blueprint</div>',
    footerTemplate:'<div style="font:8px Arial;color:#65788a;width:100%;padding:0 16mm;display:flex;justify-content:space-between"><span>Phase 0.5 • Proposed</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
    margin:{top:"18mm",bottom:"18mm",left:"16mm",right:"16mm"}});
  await browser.close();
  console.log(JSON.stringify({markdown:mdPath,html:htmlPath,pdf:path.join(out,"Enterprise AI Transformation Blueprint.pdf"),diagrams:diagramFiles.length},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
