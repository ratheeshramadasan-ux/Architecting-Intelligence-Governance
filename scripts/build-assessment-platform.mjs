import fs from "node:fs";
import path from "node:path";

const root=path.resolve("greenfield-portal");
const dataDir=path.join(root,"assets/data");
const assessmentRoot=path.join(root,"assessments");
const methodology=JSON.parse(fs.readFileSync(path.join(dataDir,"methodology.json"),"utf8"));
const discover=JSON.parse(fs.readFileSync(path.join(dataDir,"discover-content.json"),"utf8"));
const mobilise=JSON.parse(fs.readFileSync(path.join(dataDir,"mobilise-content.json"),"utf8"));
const slug=value=>value.toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");

const maturity=[
  {level:1,name:"Initial",definition:"Practices are ad hoc, reactive, dependent on individuals and weakly evidenced."},
  {level:2,name:"Developing",definition:"Foundational practices exist but coverage, ownership and consistency remain incomplete."},
  {level:3,name:"Managed",definition:"Practices are defined, owned, measured and applied consistently across the agreed scope."},
  {level:4,name:"Optimised",definition:"Practices are integrated, automated where appropriate and continuously improved using evidence."},
  {level:5,name:"Enterprise Leading",definition:"Practices create measurable enterprise advantage and are governed as reusable organisational capability."}
];
const prompts=[
  {id:"questions",name:"Generate Assessment Questions",instruction:"Generate focused assessment questions mapped to scope, evidence, scoring and accountable owners."},
  {id:"findings",name:"Generate Executive Findings",instruction:"Summarise verified strengths, gaps, risks, confidence and decisions for executives."},
  {id:"improvement",name:"Generate Improvement Plan",instruction:"Create sequenced improvement actions with owners, dependencies, evidence and measurable outcomes."},
  {id:"gap",name:"Generate Gap Analysis",instruction:"Compare current evidence with the target maturity level and identify control and capability gaps."},
  {id:"roadmap",name:"Generate Roadmap",instruction:"Sequence improvements into practical horizons without inventing dates, cost or capacity."},
  {id:"maturity",name:"Generate Maturity Summary",instruction:"Explain the evidence-supported maturity rating, uncertainty and conditions for advancement."},
  {id:"recommendations",name:"Generate Recommendations",instruction:"Generate prioritised, evidence-linked recommendations with rationale, risk reduction and expected value."}
];
const definitions=[
["Enterprise AI Readiness","Readiness","AI","Enterprise","Executive Sponsor","Assess Readiness","Enterprise AI Readiness Assessment","Measure whether the enterprise can adopt AI safely, sustainably and at scale."],
["AI Governance Maturity","Governance","AI Governance","Enterprise","AI Governance Lead","Establish Governance","Governance and Control Framework","Evaluate decision rights, policies, oversight, assurance and accountability for AI."],
["AI Risk Assessment","Risk","AI Risk","Enterprise","Risk Executive","Establish Governance","AI Risk Register","Identify and evaluate harms, uncertainty, autonomy and control exposure across AI use."],
["AI Security Assessment","Security","AI Security","Technology","CISO","Test and Validate","Security Assessment","Evaluate threats and controls across models, prompts, data, tooling and supply chains."],
["Identity & Access Assessment","Security","Identity","Technology","IAM Lead","Design the Target Architecture","IAM Assessment","Assess identities, privileges, service accounts and access controls supporting AI."],
["Data Readiness","Readiness","Data","Enterprise","Chief Data Officer","Assess Readiness","Data Inventory","Measure whether governed, usable and representative data can support priority outcomes."],
["Data Governance","Governance","Data & Integration","Enterprise","Data Governance Lead","Establish Governance","Data Governance Framework","Evaluate data ownership, quality, lineage, access, retention and assurance."],
["Business Capability Assessment","Capability","Enterprise Architecture","Business","Business Architect","Discover","Business Capability Catalogue","Assess capability performance, strategic importance, constraints and AI enablement potential."],
["Business Process Assessment","Capability","Automation","Business","Process Owner","Discover","Process Inventory","Assess process value, variability, controls, pain points and automation suitability."],
["Enterprise Architecture Assessment","Architecture","AI Architecture","Technology","Enterprise Architect","Assess Readiness","Current-State Assessment","Evaluate architecture governance, coherence, constraints, standards and target-state readiness."],
["Application Portfolio Assessment","Architecture","AI Architecture","Technology","Application Portfolio Owner","Discover","Application Portfolio","Assess application fitness, ownership, lifecycle, cost, risk and integration readiness."],
["Integration Assessment","Architecture","Data & Integration","Technology","Integration Architect","Discover","Integration Catalogue","Evaluate API, event, batch and agent integration patterns, reliability and governance."],
["Infrastructure Assessment","Architecture","Cloud AI","Technology","Infrastructure Lead","Discover","Infrastructure Assessment","Assess compute, network, resilience, observability and capacity for AI workloads."],
["Cloud Readiness","Readiness","Cloud AI","Technology","Cloud Platform Owner","Assess Readiness","Cloud Assessment","Evaluate cloud foundations, landing zones, controls, economics and operating readiness."],
["Automation Maturity","Maturity","Automation","Business","Automation Lead","Assess Readiness","Automation Inventory","Assess automation governance, delivery, reuse, controls and measurable value."],
["AI Platform Assessment","Architecture","AI Implementation","Technology","AI Platform Owner","Design the Target Architecture","AI Platform Assessment","Evaluate platform capabilities for models, agents, RAG, evaluation, operations and governance."],
["Vendor Assessment","Risk","AI Risk","Vendor","Vendor Risk Lead","Discover","Vendor Landscape","Evaluate vendor capability, security, resilience, lock-in, data use and contract controls."],
["Regulatory Compliance Assessment","Compliance","Compliance","Enterprise","Compliance Lead","Establish Governance","Regulatory Assessment","Assess obligations, evidence, accountability and control coverage across jurisdictions."],
["Skills & Workforce Assessment","Readiness","Skills & Workforce","People","People and Change Lead","Assess Readiness","Skills Assessment","Evaluate skills, roles, capacity, learning pathways and workforce impacts."],
["Operational Readiness","Readiness","AI Operations","Operations","Operations Lead","Deploy and Transition","Operational Readiness Assessment","Assess service ownership, support, monitoring, incidents, continuity and operating controls."],
["Financial Readiness","Readiness","Financial Management","Enterprise","Finance Lead","Build the Business Case","Financial Readiness Assessment","Assess funding, cost transparency, value measurement and investment governance."],
["Change Management Readiness","Readiness","Change Management","People","Change Lead","Plan Implementation","Change Readiness Assessment","Assess stakeholder readiness, adoption barriers, communication, training and reinforcement."],
["Shadow AI Assessment","Risk","Responsible AI","Enterprise","CISO","Discover","Shadow AI Register","Identify unapproved AI use, exposure, unmet demand and proportionate remediation paths."],
["Production Readiness Assessment","Readiness","AI Operations","Operations","Service Owner","Test and Validate","Production Readiness Evidence Pack","Determine whether a release can operate securely, reliably and accountably in production."]
];
const stageNumber=name=>methodology.stages.find(x=>x.name===name)?.number??1;
const assessments=definitions.map((d,index)=>{
  const [name,type,topic,industry,owner,primaryStage,deliverable,purpose]=d;
  const scope=[`${topic} capabilities, controls and operating practices`,`People, process, technology, data and governance dependencies`,`Current evidence, known exceptions and target maturity`,`Enterprise and solution-level impacts relevant to ${primaryStage}`];
  const questions=[
    `What outcomes and decisions must the ${name} support?`,
    `Which ${topic.toLowerCase()} capabilities are in scope, and who is accountable for them?`,
    "What current controls and practices are documented, implemented and operating effectively?",
    "Which source evidence proves each claimed practice or outcome?",
    "Where do evidence sources conflict, and who can resolve the conflict?",
    "What material risks, dependencies, constraints and exceptions remain?",
    "What maturity level is supported by verified evidence rather than aspiration?",
    "Which improvements are required before the next methodology decision gate?",
    "How will progress, residual risk and benefits be measured over time?"
  ];
  return {
    id:`ASM-${String(index+1).padStart(3,"0")}`,slug:slug(name),name,type,topic,industry,owner,primaryStage,
    stageNumber:stageNumber(primaryStage),deliverable,purpose,
    value:`Provides an evidence-based view of ${topic.toLowerCase()} strengths, gaps, risks and priorities so accountable leaders can make defensible investment and governance decisions.`,
    objectives:[`Establish a consistent baseline for ${topic.toLowerCase()}`,`Rate maturity using the shared five-level model`,`Identify evidence gaps, risks and improvement priorities`,`Connect findings to ${primaryStage} decisions and ${deliverable}`],
    scope,questions,
    evidence:["Approved policies, standards and decision records","Current inventories, architecture and operating records","Control design and operating-effectiveness evidence","Performance, risk, incident and financial measures","Interviews and workshops validated by accountable owners"],
    scoring:{scale:"0–4 per question",method:"0 = no evidence, 1 = initial, 2 = developing, 3 = managed, 4 = optimised or leading evidence",aggregation:"Category averages roll up only where minimum evidence thresholds are met.",confidence:"High, Medium, Low or Unverified; confidence is reported separately and never hidden inside the score."},
    risk:["Critical — immediate decision or control intervention required","High — material exposure requiring a funded response","Medium — controlled remediation with named ownership","Low — monitor through normal improvement governance"],
    recommendations:["Prioritise gaps by risk, dependency and enterprise value","Assign one accountable owner and verifiable outcome per action","Separate immediate containment from structural improvement","Reassess after evidence is updated or material change occurs"],
    relatedStages:["Discover",primaryStage,"Define Strategy","Establish Governance","Build the Business Case","Improve and Scale"].filter((x,i,a)=>a.indexOf(x)===i),
    relatedDeliverables:[deliverable,"Current-State Discovery Baseline","Enterprise AI Strategy Decision Pack"],
    roles:[owner,"Executive Sponsor","Enterprise Architect","Risk and Compliance","Evidence Owners"],
    prompts:prompts.map(x=>x.id)
  };
});
const framework={
  version:"1.0.0",status:"reusable-platform-structure",implementationLogic:"design-only",
  principles:["Cross-stage and reusable","Evidence before scoring","Maturity and confidence reported separately","Exactly one accountable owner per conclusion","Recommendations trace to evidence and decisions","Human approval required for AI-assisted drafts"],
  entities:["Assessment Definitions","Assessment Categories","Assessment Questions","Scoring Models","Evidence Requirements","Confidence Ratings","Maturity Levels","Risk Ratings","Recommendations","Improvement Actions","Executive Summaries","AI Guidance"],
  maturity,prompts,
  confidence:["Unverified","Low","Medium","High"],
  traceability:["Discovery Evidence","Readiness","Strategy","Governance","Architecture","Business Case","Implementation","Operations"],
  assessments
};
fs.writeFileSync(path.join(dataDir,"assessment-framework.json"),JSON.stringify(framework,null,2));

const detailPage=item=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${item.purpose}"><title>${item.name} | Enterprise Assessments</title><link rel="stylesheet" href="/assets/css/methodology.css?v=20260727-4"><script src="/assets/js/methodology.js?v=20260727-4" defer></script><script src="/assets/js/assessment-detail.js?v=20260727-4" defer></script></head><body data-methodology-page="assessment-detail" data-assessment="${item.slug}"><a class="skip-link" href="#main-content">Skip to content</a><header id="methodology-header"></header><main id="main-content"><div id="assessment-detail-root" class="detail-loading" role="status"><h1>${item.name}</h1><p>Loading assessment guidance…</p></div></main><footer id="methodology-footer"></footer></body></html>`;
for(const item of assessments){const dir=path.join(assessmentRoot,item.slug);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,"index.html"),detailPage(item))}
const shellPage=(title,description,kind,script)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${description}"><title>${title}</title><link rel="stylesheet" href="/assets/css/methodology.css?v=20260727-4"><script src="/assets/js/methodology.js?v=20260727-4" defer></script><script src="/assets/js/${script}?v=20260727-4" defer></script></head><body data-methodology-page="${kind}"><a class="skip-link" href="#main-content">Skip to content</a><header id="methodology-header"></header><main id="main-content"><div id="${kind}-root" class="detail-loading"><h1>${title}</h1><p>Loading assessment platform…</p></div></main><footer id="methodology-footer"></footer></body></html>`;
fs.mkdirSync(path.join(assessmentRoot,"library"),{recursive:true});
fs.mkdirSync(path.join(assessmentRoot,"dashboard"),{recursive:true});
fs.writeFileSync(path.join(assessmentRoot,"index.html"),shellPage("Enterprise Assessment Framework","A reusable, evidence-led enterprise assessment framework.","assessment-framework","assessment-platform.js"));
fs.writeFileSync(path.join(assessmentRoot,"library/index.html"),shellPage("Assessment Library","Search and browse 24 reusable enterprise assessments.","assessment-library","assessment-library.js"));
fs.writeFileSync(path.join(assessmentRoot,"dashboard/index.html"),shellPage("Enterprise Assessment Dashboard","Assessment score, risk, readiness and priority dashboard.","assessment-dashboard","assessment-dashboard.js"));

const searchRecords=[
  ...assessments.map(x=>({type:"Assessment",title:x.name,summary:x.purpose,href:`/assessments/${x.slug}/`,stage:x.primaryStage,capability:x.topic,role:x.owner,technology:x.industry,riskDomain:x.type,keywords:[x.type,x.topic,x.industry,...x.roles,...x.relatedStages,...x.relatedDeliverables,...x.questions].join(" ")})),
  ...discover.domains.map(x=>({type:"Discovery domain",title:x.name,summary:x.summary,href:`/transformation/stage-1-discover/domains/${x.slug}/`,stage:"Discover",capability:x.name,role:x.owner,keywords:[...x.information,...x.knowledge].join(" ")})),
  ...discover.deliverables.map(x=>({type:"Deliverable",title:x.name,summary:x.purpose,href:`/transformation/stage-1-discover/deliverables/${x.slug}/`,stage:"Discover",capability:x.type,role:x.owner,keywords:[...x.inputs,...x.outputs].join(" ")})),
  ...discover.workshops.map(x=>({type:"Workshop",title:x.name,summary:x.objective,href:`/transformation/stage-1-discover/workshops/${x.slug}/`,stage:"Discover",role:x.facilitator,keywords:x.questions.join(" ")})),
  ...mobilise.deliverables.map(x=>({type:"Deliverable",title:x.name,summary:x.purpose,href:`/transformation/stage-0-mobilise/deliverables/${x.slug}/`,stage:"Mobilise",capability:x.type,role:x.owner,keywords:x.inputs.join(" ")})),
  ...mobilise.workshops.map(x=>({type:"Workshop",title:x.name,summary:x.objective,href:`/transformation/stage-0-mobilise/workshops/${x.slug}/`,stage:"Mobilise",role:x.facilitator,keywords:x.questions.join(" ")})),
  ...methodology.stages.map(x=>({type:"Lifecycle stage",title:x.name,summary:x.purpose,href:x.href||`/transformation/#stage-${x.number}`,stage:x.name,capability:"Enterprise AI Transformation",keywords:`${x.output} ${x.gate}`})),
  {type:"Knowledge article",title:"Retrieval-Augmented Generation (RAG)",summary:"Knowledge grounding and retrieval patterns for enterprise AI.",href:"/pages/knowledge-discovery.html",capability:"RAG",keywords:"vector database embeddings grounding retrieval"},
  {type:"Knowledge article",title:"Model Context Protocol (MCP)",summary:"Integration patterns for tools, context and governed AI systems.",href:"/pages/knowledge-discovery.html",capability:"MCP",keywords:"agentic AI tools integration protocol"},
  {type:"Knowledge article",title:"Vector Databases",summary:"Vector storage, retrieval and enterprise architecture considerations.",href:"/pages/knowledge-discovery.html",capability:"Vector Databases",keywords:"RAG embeddings semantic search"}
];
fs.writeFileSync(path.join(dataDir,"platform-search-index.json"),JSON.stringify({version:"1.0.0",records:searchRecords},null,2));
console.log(JSON.stringify({assessments:assessments.length,prompts:prompts.length,searchRecords:searchRecords.length,pages:assessments.length+3},null,2));
