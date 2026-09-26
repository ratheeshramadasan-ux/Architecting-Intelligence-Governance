import fs from "node:fs";
import path from "node:path";

const root=path.resolve("greenfield-portal");
const dataDir=path.join(root,"assets","data");
const stageRoot=path.join(root,"transformation","stage-0-mobilise");
const templateDir=path.join(root,"downloads","mobilise");
fs.mkdirSync(dataDir,{recursive:true});
fs.mkdirSync(templateDir,{recursive:true});

const deliverables=[
  ["executive-mandate","MOB-001","Executive Mandate","Decision record","Executive Sponsor","Executive Sponsor","Authorise the transformation and state the business need, intended outcomes, authority and constraints.","When leadership is prepared to sponsor an enterprise transformation, before discovery requests are issued.",["Business need","Enterprise drivers","Intended outcomes","Authority and sponsor","Constraints and exclusions","Approval record"]],
  ["business-drivers","MOB-002","Business Drivers","Briefing","Business Owner","Executive Sponsor","Create a shared, evidence-based explanation of why enterprise AI matters now.","During mobilisation, before objectives, scope and investment assumptions are finalised.",["Driver","Evidence","Business consequence","Urgency","Affected capability","Owner"]],
  ["programme-charter","MOB-003","Programme Charter","Decision pack","Programme Director","Executive Sponsor","Define purpose, measurable objectives, scope, governance and delivery boundaries.","After mandate approval and before programme work begins.",["Purpose","Objectives","Scope","Out of scope","Roles","Governance","Milestones","Assumptions","Approval"]],
  ["scope-definition","MOB-004","Scope Definition","Decision record","Programme Director","Executive Sponsor","Make inclusions, exclusions, boundaries and interfaces explicit.","While creating the programme charter and before discovery planning.",["In scope","Out of scope","Organisational boundary","Technology boundary","Data boundary","Dependencies","Change control"]],
  ["strategic-objectives","MOB-005","Strategic Objectives","Measurement record","Business Owner","Executive Sponsor","Translate drivers into specific outcomes that guide later investment and architecture choices.","After drivers are validated and before success measures are approved.",["Objective","Business outcome","Capability affected","Measure","Time horizon","Owner","Constraints"]],
  ["stakeholder-register","MOB-006","Stakeholder Register","Register","Programme Director","Business Owner","Identify people affected by, contributing to or accountable for transformation decisions.","As soon as mandate and preliminary scope exist; reviewed throughout mobilisation.",["Stakeholder","Role","Impact","Influence","Interest","Engagement owner","Cadence"]],
  ["governance-charter","MOB-007","Governance Charter","Operating model","Platform Owner","Executive Sponsor","Define governance purpose, principles, authority, membership and evidence expectations.","Before governance forums begin making programme decisions.",["Purpose","Authority","Principles","Scope","Forums","Decision rights","Escalation","Evidence","Review"]],
  ["governance-forums","MOB-008","Governance Forums","Operating model","Platform Owner","Executive Sponsor","Define each forum’s purpose, membership, cadence, quorum and decisions.","After the governance charter is drafted and before programme kick-off.",["Forum","Purpose","Chair","Members","Cadence","Quorum","Decisions","Inputs","Outputs"]],
  ["decision-rights","MOB-009","Decision Rights","Decision model","Platform Owner","Executive Sponsor","Assign unambiguous authority for funding, risk, architecture, data, release and benefits decisions.","Alongside governance forums and the enterprise RACI.",["Decision","Recommender","Reviewers","Approver","Risk acceptor","Recorder","Escalation","Evidence"]],
  ["enterprise-raci","MOB-010","Enterprise RACI","Responsibility model","Programme Director","Platform Owner","Assign responsibility, accountability, support, consultation and information across mobilisation.","After roles and governance forums are known and before programme kick-off.",["Activity","Accountable","Responsible","Supporting","Consulted","Informed","Evidence"]],
  ["delivery-model","MOB-011","Delivery Model","Operating model","Programme Director","Platform Owner","Define how the programme organises work, teams, suppliers, increments and decisions.","Before detailed mobilisation planning and resourcing.",["Delivery approach","Workstreams","Team structure","Sourcing","Cadence","Quality controls","Dependencies","Escalation"]],
  ["operating-model","MOB-012","Operating Model","Operating model","Platform Owner","Executive Sponsor","Define initial ownership across strategy, governance, platforms, delivery and operations.","During mobilisation, refined during strategy and implementation planning.",["Capabilities","Accountabilities","Organisation","Forums","Processes","Technology enablement","Service ownership","Maturity assumptions"]],
  ["funding-model","MOB-013","Funding Model","Decision record","Finance Lead","Executive Sponsor","Define funding sources, approval thresholds, cost categories and investment governance.","Before resources are committed and before the business case stage.",["Funding source","Cost categories","Approval thresholds","Stage funding","Contingency","Assumptions","Review cadence"]],
  ["success-measures","MOB-014","Success Measures","Measurement plan","Business Owner","Executive Sponsor","Define outcome measures, baselines, target ranges, owners and measurement methods.","After strategic objectives are agreed and before mobilisation approval.",["Objective","Measure","Definition","Baseline","Target range","Data source","Owner","Cadence"]],
  ["ai-principles","MOB-015","AI Principles","Principles","Platform Owner","Executive Sponsor","Create actionable principles for later governance, architecture and investment decisions.","During mobilisation, before discovery and strategy choices.",["Principle","Why it matters","Required behaviour","Decision test","Owner","Exception route"]],
  ["risk-appetite","MOB-016","Risk Appetite Statement","Policy direction","Risk Executive","Risk Executive","Set boundaries for impact, autonomy, data use, uncertainty and prohibited activity.","Before opportunity assessment and before governance controls are designed.",["Risk domain","Appetite","Boundary","Prohibited activity","Required oversight","Approval authority","Exception route"]],
  ["raid-register","MOB-017","RAID Register","Register","Programme Director","Platform Owner","Expose risks, assumptions, issues and dependencies with owners and responses.","Created at mobilisation and maintained throughout the programme.",["Type","Description","Cause","Impact","Likelihood","Owner","Response","Due date","Status"]],
  ["mobilisation-plan","MOB-018","Mobilisation Plan","Plan","Programme Director","Platform Owner","Sequence mobilisation activities, workshops, deliverables, decisions and resources.","After workstreams and owners are defined and before programme kick-off.",["Activity","Outcome","Owner","Start","Finish","Dependency","Deliverable","Decision","Status"]],
  ["communication-plan","MOB-019","Communication Plan","Plan","Change Lead","Programme Director","Plan transparent communication, consultation, feedback and adoption activity.","After the stakeholder register and before programme kick-off.",["Audience","Objective","Message","Channel","Timing","Owner","Feedback route","Measure"]],
  ["executive-briefing-pack","MOB-020","Executive Briefing Pack","Briefing","Programme Director","Executive Sponsor","Give decision-makers a concise, evidence-backed view of mandate, choices, risks and next actions.","For mobilisation review and gate approval.",["Decision required","Executive summary","Drivers","Scope","Governance","Funding","Risk appetite","Progress","Risks","Recommendation"]]
];

const deliverableBySlug=new Map(deliverables.map(item=>[item[0],item]));
const workstreams=[
  ["executive-sponsorship","Executive Sponsorship","Secure visible, accountable sponsorship and authority for enterprise participation.",["Confirm the business need and sponsor","Draft and approve the executive mandate","Agree executive decision cadence","Prepare the executive briefing"],["Existing strategy","Board or executive priorities","Known regulatory and market pressures"],["Executive Mandate","Executive Briefing Pack"],["executive-mandate","executive-briefing-pack"],"Executive Sponsor","Programme Director","Generate a sponsor-ready mandate and briefing narrative"],
  ["business-drivers","Business Drivers","Create a shared business rationale and measurable strategic objectives.",["Collect internal and external evidence","Distinguish problems from technology ideas","Prioritise drivers","Define strategic objectives and success measures"],["Performance evidence","Customer and workforce needs","Risk and compliance pressures","Strategic plans"],["Business Drivers","Strategic Objectives","Success Measures"],["business-drivers","strategic-objectives","success-measures"],"Business Owner","Finance Lead","Generate evidence-led business drivers and outcome measures"],
  ["programme-governance","Programme Governance","Establish forums, decision rights, accountability and escalation.",["Draft governance charter","Design forums and quorum","Assign decision rights","Validate enterprise RACI"],["Mandate","Organisation model","Existing governance bodies","Risk appetite"],["Governance Charter","Governance Forums","Decision Rights","Enterprise RACI"],["governance-charter","governance-forums","decision-rights","enterprise-raci"],"Platform Owner","Risk and Compliance Lead","Generate governance charter, forum and decision-right proposals"],
  ["funding-business-ownership","Funding & Business Ownership","Establish accountable outcome ownership and a controlled funding path.",["Name business owners","Define funding sources and thresholds","Agree stage-based investment","Record benefit ownership"],["Strategic objectives","Finance policies","Initial cost categories","Approval authorities"],["Funding Model","Success Measures"],["funding-model","success-measures"],"Executive Sponsor","Finance Lead","Generate a funding model with explicit assumptions and decision thresholds"],
  ["stakeholder-engagement","Stakeholder Engagement","Identify affected groups and plan meaningful communication and consultation.",["Identify stakeholders","Assess influence and impact","Plan engagement","Create feedback and escalation routes"],["Scope","Organisation charts","Change obligations","Consultation requirements"],["Stakeholder Register","Communication Plan"],["stakeholder-register","communication-plan"],"Programme Director","Change Lead","Generate a stakeholder register and communication plan"],
  ["operating-model","Operating Model","Define initial delivery, sourcing, capability and service ownership.",["Choose delivery approach","Define team and supplier structure","Assign capability ownership","Identify initial service owner"],["Scope","Governance model","Current organisation","Sourcing constraints"],["Delivery Model","Operating Model"],["delivery-model","operating-model"],"Platform Owner","Enterprise Architect","Generate delivery and operating model options with trade-offs"],
  ["risk-compliance","Risk & Compliance","Set risk, compliance, privacy, security and human-oversight boundaries.",["Collect obligations","Define risk appetite","Set prohibited uses","Draft actionable AI principles","Define exception authority"],["Enterprise risk appetite","Regulatory obligations","Security and privacy policies","Legal constraints"],["AI Principles","Risk Appetite Statement"],["ai-principles","risk-appetite"],"Risk Executive","Audit and Assurance Lead","Generate risk-appetite and AI-principle drafts for control-owner review"],
  ["mobilisation-planning","Mobilisation Planning","Coordinate activities, workshops, deliverables, dependencies, RAID and gate readiness.",["Build mobilisation schedule","Sequence workshops","Maintain RAID","Track deliverables and decisions","Prepare gate evidence"],["All workstream plans","Resource availability","Decision calendar","Dependencies"],["Programme Charter","Scope Definition","RAID Register","Mobilisation Plan","Executive Briefing Pack"],["programme-charter","scope-definition","raid-register","mobilisation-plan","executive-briefing-pack"],"Programme Director","Platform Owner","Generate an integrated mobilisation plan and gate-readiness summary"]
];

const workshops=[
  ["executive-vision","Executive Vision Workshop","Agree the business need, ambition, outcomes, sponsorship and boundaries.","3 hours",["Executive Sponsor","CIO/CTO","Business Owners","Platform Owner","Risk Executive"],["Current strategy","Known drivers and constraints","Initial AI ambition"],["Why must the organisation act now?","Which outcomes matter?","What must not happen?","Who owns the mandate?"],["Executive Mandate","Strategic Objectives"],["Approve ambition and sponsor","Confirm scope direction"]],
  ["business-drivers","Business Drivers Workshop","Create an evidence-based business rationale and initial success measures.","3 hours",["Business Owners","Finance","Strategy","Customer/Service Leads","Programme Director"],["Performance evidence","Customer and workforce needs","Strategic plans"],["What problem are we solving?","What evidence supports urgency?","Which measures would prove value?"],["Business Drivers","Success Measures"],["Validate drivers","Assign outcome owners"]],
  ["governance","Governance Workshop","Design forums, decision rights, RACI, evidence and escalation.","4 hours",["Platform Owner","Risk","Security","Privacy","Legal","Architecture","Audit","Programme Director"],["Draft mandate","Existing governance map","Risk policies"],["Which decisions exist?","Who approves and accepts risk?","What evidence is mandatory?","How are exceptions handled?"],["Governance Charter","Governance Forums","Decision Rights","Enterprise RACI"],["Approve governance design","Confirm gate forum"]],
  ["stakeholder","Stakeholder Workshop","Identify impacted stakeholders and plan communication, consultation and feedback.","3 hours",["Programme","Business Owners","Change Lead","HR","Communications","Control Functions"],["Draft scope","Organisation map","Change obligations"],["Who is affected?","Whose knowledge is required?","Who can block or accelerate progress?","How will feedback change decisions?"],["Stakeholder Register","Communication Plan"],["Approve engagement priorities"]],
  ["programme-kick-off","Programme Kick-off","Align the team on mandate, scope, roles, plan, controls and ways of working.","2 hours",["Core Programme Team","Workstream Leads","Control Functions","Business Owners","Service Owner"],["Approved charter","RACI","Mobilisation plan","RAID register"],["What are we delivering?","How will decisions be made?","How do we raise risk?","What happens next?"],["Confirmed Mobilisation Plan","Updated RAID Register"],["Accept working agreements","Confirm immediate actions"]],
  ["mobilisation-review","Mobilisation Review","Assess evidence completeness and recommend a Mobilisation Approval decision.","4 hours",["Executive Sponsor","Platform Owner","Programme Director","Business Owner","Risk","Finance","Audit"],["All mandatory deliverables","Exit checklist","Open conditions and risks"],["Is the programme authorised and bounded?","Are owners and funding clear?","Are risk boundaries approved?","Can discovery begin safely?"],["Executive Briefing Pack","Gate decision record"],["Mobilisation gate decision"]]
];

const references=[
  "Approved Enterprise AI Transformation Blueprint v1.0",
  "Phase 0 Information Architecture and content taxonomy",
  "Organisation strategy, policies and delegation-of-authority records",
  "Applicable sector regulation and public-sector directives",
  "Canonical Knowledge Centre concepts and governance guidance"
];

const common={
  publicSector:"Account for public value, statutory authority, accessibility, transparency, records management, procurement rules and citizen impact.",
  privateSector:"Connect the work to competitive value, customer outcomes, shareholder accountability, commercial risk, workforce impact and investment governance.",
  pitfalls:["Starting with a technology product instead of a business need","Using vague ownership such as “the AI team”","Treating consultation as communication after decisions are made","Approving optimistic exact numbers without evidence","Allowing deliverables to exist without a decision or downstream use"],
  success:["The output is specific enough to guide a decision","An accountable owner and approver are named","Evidence sources and assumptions are visible","Dependencies and downstream uses are linked","Open conditions have owners and dates"]
};

const raciByWorkstream=Object.fromEntries(workstreams.map(w=>[w[0],[
  ["Set direction",w[7],"Programme Director","Business, Architecture and Control Leads"],
  ["Collect evidence",w[7],"Assigned Workstream Lead",w[8]],
  ["Validate output",w[8],"Subject-Matter Reviewers","Audit and Assurance"],
  ["Approve deliverables",w[7],"Named Deliverable Approver","Programme Board"]
]]));

const content={
  version:"1.0.0",
  stage:"stage-0-mobilise",
  references,
  common,
  workstreams:workstreams.map(w=>({slug:w[0],name:w[1],summary:w[2],activities:w[3],inputs:w[4],outputs:w[5],deliverables:w[6],owner:w[7],validator:w[8],assistant:w[9],raci:raciByWorkstream[w[0]],relatedStages:["Stage 0 — Mobilise","Stage 1 — Discover","Stage 3 — Define Strategy","Stage 4 — Establish Governance"]})),
  deliverables:deliverables.map(d=>({
    slug:d[0],id:d[1],name:d[2],type:d[3],criticality:"mandatory",owner:d[4],approver:d[5],purpose:d[6],when:d[7],structure:d[8],
    why:`Without a reliable ${d[2]}, later stages may act on unclear authority, incomplete evidence or unowned decisions.`,
    inputs:["Approved upstream Mobilise evidence","Named enterprise owners and reviewers","Applicable policies, obligations and organisational records"],
    mistakes:common.pitfalls,
    ai:`Draft a ${d[2]} using only the supplied enterprise context. Identify missing evidence, label assumptions, avoid invented facts and exact unsupported figures, show alternatives where a decision is required, and end with named review and approval actions.`,
    related:deliverables.filter(other=>other[0]!==d[0]).slice(Math.max(0,deliverables.indexOf(d)-2),Math.max(0,deliverables.indexOf(d)-2)+4).map(other=>other[0]),
    approval:`${d[5]} approves the record after ${d[4]} confirms completeness and required reviewers validate the evidence.`,
    publicSector:common.publicSector,privateSector:common.privateSector,success:common.success,
    template:`/downloads/mobilise/${d[0]}-template.md`
  })),
  workshops:workshops.map(w=>({
    slug:w[0],name:w[1],objective:w[2],duration:w[3],participants:w[4],preparation:w[5],questions:w[6],outputs:w[7],decisions:w[8],
    facilitator:w[0]==="mobilisation-review"?"Platform Owner":"Enterprise AI Methodology Lead",
    agenda:["Welcome, purpose and decision context","Review evidence and assumptions","Facilitated discussion","Confirm outputs, owners and open questions","Record decisions and next actions"],
    assistant:`Create a time-boxed agenda for the ${w[1]}. Use the stated objective, participants, preparation, questions, outputs and decisions. Include facilitator notes, evidence gaps, decision checkpoints and a closing action log.`
  })),
  assistants:[
    ["generate-programme-charter","Generate Programme Charter","programme-charter"],
    ["generate-stakeholder-register","Generate Stakeholder Register","stakeholder-register"],
    ["generate-executive-summary","Generate Executive Summary","executive-briefing-pack"],
    ["generate-governance-charter","Generate Governance Charter","governance-charter"],
    ["generate-business-drivers","Generate Business Drivers","business-drivers"],
    ["generate-success-measures","Generate Success Measures","success-measures"],
    ["generate-risk-appetite","Generate Risk Appetite","risk-appetite"],
    ["generate-communication-plan","Generate Communication Plan","communication-plan"]
  ].map(a=>({id:a[0],label:a[1],deliverable:a[2],prompt:deliverableBySlug.get(a[2])?`Help me draft ${deliverableBySlug.get(a[2])[2]}. Use only the context I provide. Identify missing evidence and assumptions. Return a structured draft aligned with the approved Mobilise methodology. Do not approve it or invent enterprise facts.`:""}))
};

fs.writeFileSync(path.join(dataDir,"mobilise-content.json"),JSON.stringify(content,null,2));

const detailPage=(kind,slug,title)=>`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${title} guidance for the Mobilise stage of enterprise AI transformation.">
<title>${title} | Stage 0 — Mobilise</title><link rel="stylesheet" href="/assets/css/methodology.css?v=20260727-2">
<script src="/assets/js/methodology.js?v=20260727-2" defer></script><script src="/assets/js/mobilise-detail.js?v=20260727-2" defer></script></head>
<body data-methodology-page="mobilise-detail" data-content-kind="${kind}" data-content-slug="${slug}"><a class="skip-link" href="#main-content">Skip to content</a><header id="methodology-header"></header>
<main id="main-content"><div id="mobilise-detail-root" class="detail-loading" role="status"><h1>${title}</h1><p>Loading guidance…</p></div></main><footer id="methodology-footer"></footer></body></html>`;

for(const item of content.workstreams){
  const dir=path.join(stageRoot,"workstreams",item.slug);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,"index.html"),detailPage("workstream",item.slug,item.name));
}
for(const item of content.deliverables){
  const dir=path.join(stageRoot,"deliverables",item.slug);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,"index.html"),detailPage("deliverable",item.slug,item.name));
  const template=`# ${item.name} — Template Starter

> Status: blank starter for local completion. This file is not approved evidence until reviewed and approved through the Mobilise methodology.

## Purpose

${item.purpose}

${item.structure.map((section,index)=>`## ${index+1}. ${section}\n\n[Complete this section using verified enterprise evidence. Record owner, source, assumptions and review status.]\n`).join("\n")}
## Review and approval

- Owner: ${item.owner}
- Required approver: ${item.approver}
- Version:
- Reviewers:
- Evidence sources:
- Open conditions:
- Decision:
- Approval date:
`;
  fs.writeFileSync(path.join(templateDir,`${item.slug}-template.md`),template);
}
for(const item of content.workshops){
  const dir=path.join(stageRoot,"workshops",item.slug);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,"index.html"),detailPage("workshop",item.slug,item.name));
}
for(const [slug,title,view] of [["executive","Mobilise Executive Dashboard","executive"],["programme-manager","Mobilise Programme Manager Workspace","programme"]]){
  const dir=path.join(stageRoot,"dashboards",slug);fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,"index.html"),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${title}"><title>${title}</title><link rel="stylesheet" href="/assets/css/methodology.css?v=20260727-2"><script src="/assets/js/methodology.js?v=20260727-2" defer></script><script src="/assets/js/mobilise-dashboard.js?v=20260727-2" defer></script></head><body data-methodology-page="mobilise-dashboard" data-dashboard="${view}"><a class="skip-link" href="#main-content">Skip to content</a><header id="methodology-header"></header><main id="main-content"><div id="mobilise-dashboard-root" class="detail-loading" role="status"><h1>${title}</h1><p>Loading dashboard…</p></div></main><footer id="methodology-footer"></footer></body></html>`);
}

const searchRecords=[
  ...content.workstreams.map(item=>({type:"Workstream",title:item.name,summary:item.summary,href:`/transformation/stage-0-mobilise/workstreams/${item.slug}/`,keywords:[...item.activities,...item.inputs,...item.outputs,item.owner,item.validator].join(" ")})),
  ...content.deliverables.map(item=>({type:"Deliverable",title:item.name,summary:item.purpose,href:`/transformation/stage-0-mobilise/deliverables/${item.slug}/`,keywords:[item.type,item.owner,item.approver,...item.inputs,...item.structure].join(" ")})),
  ...content.workshops.map(item=>({type:"Workshop",title:item.name,summary:item.objective,href:`/transformation/stage-0-mobilise/workshops/${item.slug}/`,keywords:[item.duration,...item.participants,...item.questions,...item.outputs].join(" ")})),
  {type:"Dashboard",title:"Mobilise Executive Dashboard",summary:"Executive progress, approvals, risks, decisions and readiness.",href:"/transformation/stage-0-mobilise/dashboards/executive/",keywords:"executive progress approvals risks decisions readiness milestone"},
  {type:"Dashboard",title:"Mobilise Programme Manager Workspace",summary:"Activities, deliverables, RACI, workshops, decisions, RAID and approval status.",href:"/transformation/stage-0-mobilise/dashboards/programme-manager/",keywords:"programme manager activity tracker deliverable workshop decision RAID approval"}
];
fs.writeFileSync(path.join(dataDir,"mobilise-search-index.json"),JSON.stringify({version:content.version,records:searchRecords},null,2));

const searchDir=path.join(stageRoot,"search");fs.mkdirSync(searchDir,{recursive:true});
fs.writeFileSync(path.join(searchDir,"index.html"),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Search the complete Mobilise methodology."><title>Search Mobilise | Enterprise AI Transformation</title><link rel="stylesheet" href="/assets/css/methodology.css?v=20260727-2"><script src="/assets/js/methodology.js?v=20260727-2" defer></script><script src="/assets/js/mobilise-search.js?v=20260727-2" defer></script></head><body data-methodology-page="mobilise-search"><a class="skip-link" href="#main-content">Skip to content</a><header id="methodology-header"></header><main id="main-content"><section class="detail-hero"><div class="methodology-wrap"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/transformation/">Transformation</a><span>/</span><a href="/transformation/stage-0-mobilise/">Mobilise</a><span>/</span><span>Search</span></nav><span class="eyebrow">Indexed Mobilise content</span><h1>Find Mobilise guidance.</h1><p class="hero-lead">Search workstreams, deliverables, workshops and role-specific views.</p></div></section><section class="methodology-wrap methodology-section"><form id="mobilise-search-form" class="mobilise-search-form" role="search"><label for="mobilise-search-query">What do you need to do?</label><div><input id="mobilise-search-query" type="search" minlength="2" placeholder="For example: prepare programme charter"><button class="button primary">Search</button></div></form><p id="mobilise-search-status" role="status" aria-live="polite"></p><div id="mobilise-search-results" class="search-result-list"></div></section></main><footer id="methodology-footer"></footer></body></html>`);

console.log(JSON.stringify({workstreams:content.workstreams.length,deliverables:content.deliverables.length,workshops:content.workshops.length,templates:content.deliverables.length,searchRecords:searchRecords.length,pages:content.workstreams.length+content.deliverables.length+content.workshops.length+3},null,2));
