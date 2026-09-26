import fs from "node:fs";
import path from "node:path";
const root=path.resolve("greenfield-portal"),dataDir=path.join(root,"assets/data"),stageRoot=path.join(root,"transformation/stage-2-assess-readiness");
const methodPath=path.join(dataDir,"methodology.json"),methodology=JSON.parse(fs.readFileSync(methodPath,"utf8"));
const assessments=JSON.parse(fs.readFileSync(path.join(dataDir,"assessment-framework.json"),"utf8"));
const discover=JSON.parse(fs.readFileSync(path.join(dataDir,"discover-content.json"),"utf8"));
const platformSearch=JSON.parse(fs.readFileSync(path.join(dataDir,"platform-search-index.json"),"utf8"));
const slug=x=>x.toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");

const workspaceDefs=[
["Enterprise Readiness","Executive Sponsor",["Enterprise AI Readiness","Financial Readiness","Change Management Readiness"],"Synthesise enterprise capability, risk, investment and change evidence into an overall readiness disposition."],
["Business Readiness","Business Owner",["Business Capability Assessment","Business Process Assessment","Financial Readiness"],"Determine whether business outcomes, ownership, processes and value measures can support transformation."],
["Governance Readiness","AI Governance Lead",["AI Governance Maturity","AI Risk Assessment","Regulatory Compliance Assessment"],"Determine whether decision rights, policy, risk appetite, controls and assurance are sufficient to proceed."],
["Technology Readiness","Enterprise Architect",["Enterprise Architecture Assessment","Application Portfolio Assessment","Integration Assessment","Infrastructure Assessment","Cloud Readiness"],"Determine whether the technology estate can support secure, scalable and governable enterprise AI."],
["Data Readiness","Chief Data Officer",["Data Readiness","Data Governance"],"Determine whether priority data is usable, governed, representative, lawful and operationally sustainable."],
["Security Readiness","CISO",["AI Security Assessment","Identity & Access Assessment","Vendor Assessment"],"Determine whether material threats, access risks and third-party exposures are controlled within appetite."],
["AI Readiness","AI Platform Owner",["Enterprise AI Readiness","AI Platform Assessment","AI Governance Maturity"],"Determine whether AI platform, evaluation, model, agent and responsible-AI capabilities can support delivery."],
["Automation Readiness","Automation Lead",["Automation Maturity","Business Process Assessment"],"Determine whether automation demand, delivery, controls, reuse and operations can support scaled change."],
["Operational Readiness","Operations Lead",["Operational Readiness","Production Readiness Assessment"],"Determine whether accountable service ownership, support, monitoring, incidents and continuity can sustain AI."],
["Change Readiness","Change Lead",["Change Management Readiness","Skills & Workforce Assessment"],"Determine whether stakeholders, skills, capacity, communications and adoption mechanisms can absorb change."]
];
const evidenceByTopic={
  "Enterprise Readiness":["Business Strategy & Objectives","Financial Baseline","Existing Governance"],
  "Business Readiness":["Business Capabilities","Business Processes","Organisational Structure"],
  "Governance Readiness":["Existing Governance","Regulatory & Compliance","Shadow AI & Unapproved Technology"],
  "Technology Readiness":["Applications & Systems","Integration & APIs","Infrastructure & Hosting","Cloud Platforms"],
  "Data Readiness":["Data & Information","Regulatory & Compliance"],
  "Security Readiness":["Cybersecurity","Identity & Access Management","Vendors & Third Parties"],
  "AI Readiness":["AI Landscape","Data & Information","Shadow AI & Unapproved Technology"],
  "Automation Readiness":["Automation Landscape","Business Processes"],
  "Operational Readiness":["Operations & Service Management","Infrastructure & Hosting","Skills & Workforce"],
  "Change Readiness":["Skills & Workforce","Organisational Structure","Business Strategy & Objectives"]
};
const deliverableDefs=[
["Enterprise Readiness Report","Report","Methodology Lead","Executive Sponsor"],["Executive Readiness Summary","Executive brief","Programme Director","Executive Sponsor"],
["Gap Analysis Register","Register","Methodology Lead","Programme Director"],["Critical Gap Register","Register","Risk Executive","Executive Sponsor"],
["Capability Heat Map","Visual analysis","Enterprise Architect","CIO / CTO"],["Readiness Dashboard","Dashboard","Programme Director","Executive Sponsor"],
["Prioritised Improvement Plan","Plan","Programme Director","Executive Sponsor"],["Executive Recommendations","Decision advice","Methodology Lead","Executive Sponsor"],
["90 Day Roadmap","Roadmap","Programme Director","CIO / CTO"],["6 Month Roadmap","Roadmap","Programme Director","CIO / CTO"],
["12 Month Roadmap","Roadmap","Programme Director","Executive Sponsor"],["24 Month Roadmap","Roadmap","Programme Director","Executive Sponsor"],
["Investment Considerations","Investment analysis","Finance Lead","Executive Sponsor"],["Transformation Readiness Scorecard","Scorecard","Methodology Lead","CIO / CTO"],
["Executive Approval Pack","Approval pack","Programme Director","Executive Sponsor"],["Decision Pack","Decision pack","Programme Director","Executive Steering Committee"],
["Programme Recommendation","Recommendation","Programme Director","Executive Sponsor"]
];
const readinessCriteria=["Evidence completeness meets the agreed threshold","Material gaps have named owners and business impact","Critical risks are within appetite or have approved containment","Dependencies and resolution stages are explicit","Investment ranges and timing assumptions are transparent","The executive decision and conditions are recorded"];
const workspaces=workspaceDefs.map((x,i)=>{
  const [name,owner,relatedAssessments,summary]=x;
  const relatedEvidence=evidenceByTopic[name];
  return {id:`RDW-${String(i+1).padStart(2,"0")}`,slug:slug(name),name,owner,summary,
    executiveSummary:`${name} converts validated discovery evidence and assessment results into a decision view covering readiness, gaps, risks, dependencies, priorities and conditions to proceed.`,
    objectives:[`Determine evidence-supported ${name.toLowerCase()}`,`Identify and classify gaps by impact, urgency and effort`,`Separate critical conditions from deferrable improvements`,`Recommend an accountable path into strategy`],
    readinessCriteria,evidenceConsumed:relatedEvidence,
    assessmentResults:["Record maturity and score separately","Display evidence confidence and freshness","Show category strengths, gaps and unresolved conflicts","Do not aggregate unverified results"],
    gapAnalysis:["Compare evidence-supported current state with the approved target state","Record business impact, risk, priority, effort and dependencies","Assign an owner and target resolution stage","Trace every recommendation to its originating gap"],
    risks:["False confidence from incomplete evidence","Average scores hiding critical control failures","Unfunded or ownerless remediation","Dependencies omitted from roadmap timing"],
    dependencies:["Approved Discover baseline","Completed related assessments","Named evidence and action owners","Executive risk and investment decisions"],
    recommendations:["Contain critical exposure before progression","Fund enabling dependencies before downstream delivery","Sequence quick wins without displacing structural improvement","Carry approved conditions into strategy governance"],
    relatedAssessments,relatedDeliverables:["Enterprise Readiness Report","Gap Analysis Register","Prioritised Improvement Plan","Executive Approval Pack"],
    relatedTemplates:["Readiness workspace evidence sheet","Gap record template","Recommendation traceability record","Executive decision record"],
    aiGuidance:"Generate evidence-grounded readiness findings. Separate verified facts, gaps, assumptions and conflicts. Never invent scores, cost, duration or approval."
  };
});
const deliverables=deliverableDefs.map((x,i)=>{
  const [name,type,owner,approval]=x,id=`RDY-${String(i+1).padStart(3,"0")}`,deliverableSlug=slug(name);
  return {id,slug:deliverableSlug,name,type,owner,approval,
    purpose:`Provide a governed ${name.toLowerCase()} that supports the Executive Readiness Decision.`,
    value:"Turns evidence, assessment findings, gaps and priorities into transparent executive action and investment choices.",
    inputs:["Validated Discover evidence","Approved assessment results and confidence","Gap and risk records","Dependencies, constraints and investment assumptions"],
    outputs:[name,"Traceability references","Named actions and owners","Decision or approval record"],
    relatedAssessments:assessments.assessments.filter(a=>a.relatedStages.includes("Assess Readiness")||["Enterprise AI Readiness","Data Readiness","Cloud Readiness"].includes(a.name)).slice(0,6).map(a=>a.name),
    relatedEvidence:discover.domains.slice(i%10,(i%10)+4).map(d=>d.name),
    relatedStages:["Discover","Assess Readiness","Define Strategy","Establish Governance","Build the Business Case"],
    structure:["Executive purpose and decision required","Evidence and confidence summary","Assessment results","Gaps, risks and dependencies","Recommendations and prioritisation","Roadmap and investment considerations","Decision, conditions and approvals"],
    template:`/downloads/readiness/${deliverableSlug}.md`
  };
});
const gapModel={
  fields:["Current State","Target State","Business Impact","Risk","Priority","Estimated Effort","Dependencies","Owner","Target Resolution Stage","Related Capability","Related Deliverables","Recommendation"],
  statuses:["Identified","Validated","Approved","In progress","Blocked","Resolved","Accepted"],
  rules:["Every gap requires traceable evidence and assessment context","Priority cannot override a critical regulatory or safety constraint","Effort is a range until delivery planning validates it","Closure requires new evidence and accountable approval"]
};
const prioritisation={
  dimensions:["Business Value","Risk Reduction","Regulatory Impact","Implementation Complexity","Dependencies","Cost","Time","Strategic Importance","Executive Visibility","Quick Wins","Long Term Investment"],
  scale:"1–5 directional rating per dimension; confidence recorded separately",
  method:"Use facilitated judgement and documented rationale. Do not calculate false precision from incomparable dimensions.",
  outcomes:["Immediate containment","90-day enabling action","6-month capability improvement","12-month structural investment","24-month enterprise optimisation"]
};
const decisions=[
  {name:"Proceed",meaning:"Evidence supports progression without material readiness conditions.",nextStage:"Define Strategy"},
  {name:"Proceed with Conditions",meaning:"Progression is justified if named conditions, owners and deadlines remain under executive oversight.",nextStage:"Define Strategy with controlled conditions"},
  {name:"Delay",meaning:"Critical gaps must be resolved before strategy work can proceed reliably.",nextStage:"Remain in Assess Readiness"},
  {name:"Do Not Proceed",meaning:"Risk, value, feasibility or strategic alignment does not justify continued transformation.",nextStage:"Close or reframe the programme"}
].map(x=>({...x,required:["Business Justification","Risk","Required Actions","Executive Recommendation","Next Stage"]}));
const prompts=["Generate Gap Analysis","Generate Executive Summary","Generate Recommendations","Generate Improvement Roadmap","Generate Executive Decision Paper","Generate Investment Justification","Generate Readiness Report","Generate Executive Presentation"].map((name,i)=>({id:`RAP-${String(i+1).padStart(2,"0")}`,name,instruction:`${name} from verified discovery evidence, assessment results, gaps and confidence. Mark assumptions and require human approval.`}));
const traceability=["Discovery Evidence","Assessment","Gap","Recommendation","Roadmap","Strategy"];
const visualisations=[
  ["Capability Heat Map","Compare capability readiness and evidence confidence."],["Risk Heat Map","Plot likelihood and impact while retaining named risk ownership."],
  ["Readiness Heat Map","Compare workstream status without hiding critical blockers."],["Business Impact Matrix","Compare business impact and urgency."],
  ["Effort vs Value Matrix","Separate quick wins, enabling work and long-term investment."],["Dependency Matrix","Expose sequencing and cross-workstream dependencies."],
  ["Roadmap Timeline","Sequence 90-day, 6-month, 12-month and 24-month horizons."]
].map((x,i)=>({id:`VIS-${i+1}`,slug:slug(x[0]),name:x[0],purpose:x[1]}));
const content={version:"1.0.0",stage:2,executiveQuestion:"Based on the evidence collected so far, should our organisation proceed with Enterprise AI transformation, and if so, what is the recommended path forward?",workspaces,deliverables,gapModel,prioritisation,decisions,prompts,traceability,visualisations};
fs.writeFileSync(path.join(dataDir,"readiness-content.json"),JSON.stringify(content,null,2));
const stage=methodology.stages.find(x=>x.number===2);stage.status="available";stage.href="/transformation/stage-2-assess-readiness/";fs.writeFileSync(methodPath,JSON.stringify(methodology,null,2));

const templatesDir=path.join(root,"downloads/readiness");fs.mkdirSync(templatesDir,{recursive:true});
for(const item of deliverables)fs.writeFileSync(path.join(templatesDir,`${item.slug}.md`),`# ${item.name}\n\nStatus: DRAFT — HUMAN VALIDATION REQUIRED\n\n${item.structure.map((x,i)=>`## ${i+1}. ${x}\n\n[Complete with traceable evidence, accountable ownership and confidence.]\n`).join("\n")}`);
const detail=(kind,item)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${item.summary||item.purpose}"><title>${item.name} | Assess Readiness</title><link rel="stylesheet" href="/assets/css/methodology.css?v=20260727-5"><script src="/assets/js/methodology.js?v=20260727-5" defer></script><script src="/assets/js/readiness-detail.js?v=20260727-5" defer></script></head><body data-methodology-page="readiness-detail" data-content-kind="${kind}" data-content-slug="${item.slug}"><a class="skip-link" href="#main-content">Skip to content</a><header id="methodology-header"></header><main id="main-content"><div id="readiness-detail-root" class="detail-loading"><h1>${item.name}</h1><p>Loading decision guidance…</p></div></main><footer id="methodology-footer"></footer></body></html>`;
for(const [kind,items,folder] of [["workspace",workspaces,"workspaces"],["deliverable",deliverables,"deliverables"]])for(const item of items){const dir=path.join(stageRoot,folder,item.slug);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,"index.html"),detail(kind,item))}
for(const [slugName,title,view] of [["enterprise","Enterprise Readiness Dashboard","enterprise"],["programme","Readiness Programme Dashboard","programme"],["architecture","Architecture Readiness Dashboard","architecture"],["operations","Operations Readiness Dashboard","operations"]]){const dir=path.join(stageRoot,"dashboards",slugName);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,"index.html"),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${title}"><title>${title}</title><link rel="stylesheet" href="/assets/css/methodology.css?v=20260727-5"><script src="/assets/js/methodology.js?v=20260727-5" defer></script><script src="/assets/js/readiness-dashboard.js?v=20260727-5" defer></script></head><body data-methodology-page="readiness-dashboard" data-dashboard="${view}"><a class="skip-link" href="#main-content">Skip to content</a><header id="methodology-header"></header><main id="main-content"><div id="readiness-dashboard-root" class="detail-loading"><h1>${title}</h1><p>Loading dashboard…</p></div></main><footer id="methodology-footer"></footer></body></html>`)}
const visualsDir=path.join(stageRoot,"visualisations");fs.mkdirSync(visualsDir,{recursive:true});fs.writeFileSync(path.join(visualsDir,"index.html"),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Reusable readiness heat maps and decision visualisations."><title>Readiness Heat Maps and Visualisations</title><link rel="stylesheet" href="/assets/css/methodology.css?v=20260727-5"><script src="/assets/js/methodology.js?v=20260727-5" defer></script><script src="/assets/js/readiness-visualisations.js?v=20260727-5" defer></script></head><body data-methodology-page="readiness-visualisations"><a class="skip-link" href="#main-content">Skip to content</a><header id="methodology-header"></header><main id="main-content"><div id="readiness-visualisations-root" class="detail-loading"><h1>Readiness Heat Maps and Visualisations</h1><p>Loading visualisation specifications…</p></div></main><footer id="methodology-footer"></footer></body></html>`);
const readinessSearch=[
  {type:"Lifecycle stage",title:"Assess Readiness",summary:"Transform discovery evidence and assessments into an Executive Readiness Decision.",href:"/transformation/stage-2-assess-readiness/",stage:"Assess Readiness",keywords:"are we ready gap analysis executive summary roadmaps recommendations heat maps decision framework"},
  ...workspaces.map(x=>({type:"Readiness workspace",title:x.name,summary:x.summary,href:`/transformation/stage-2-assess-readiness/workspaces/${x.slug}/`,stage:"Assess Readiness",role:x.owner,keywords:[...x.relatedAssessments,...x.evidenceConsumed,...x.recommendations].join(" ")})),
  ...deliverables.map(x=>({type:"Readiness deliverable",title:x.name,summary:x.purpose,href:`/transformation/stage-2-assess-readiness/deliverables/${x.slug}/`,stage:"Assess Readiness",role:x.owner,keywords:[...x.inputs,...x.outputs,...x.relatedAssessments].join(" ")})),
  ...visualisations.map(x=>({type:"Readiness visualisation",title:x.name,summary:x.purpose,href:"/transformation/stage-2-assess-readiness/visualisations/",stage:"Assess Readiness",keywords:"heat map matrix roadmap readiness gap risk impact effort value dependency"})),
  ...decisions.map(x=>({type:"Decision framework",title:x.name,summary:x.meaning,href:"/transformation/stage-2-assess-readiness/#decision",stage:"Assess Readiness",keywords:`executive decision ${x.required.join(" ")} ${x.nextStage}`})),
  ...prompts.map(x=>({type:"AI prompt builder",title:x.name,summary:x.instruction,href:"/transformation/stage-2-assess-readiness/#ai-guidance",stage:"Assess Readiness",keywords:"human reviewed guided assistance"}))
];
const old=platformSearch.records.filter(x=>!["Readiness workspace","Readiness deliverable","Readiness visualisation","Decision framework","AI prompt builder"].includes(x.type)&&x.title!=="Assess Readiness");
fs.writeFileSync(path.join(dataDir,"platform-search-index.json"),JSON.stringify({version:"1.1.0",records:[...old,...readinessSearch]},null,2));
console.log(JSON.stringify({workspaces:workspaces.length,deliverables:deliverables.length,templates:deliverables.length,dashboards:4,visualisations:visualisations.length,prompts:prompts.length,searchRecords:old.length+readinessSearch.length},null,2));
