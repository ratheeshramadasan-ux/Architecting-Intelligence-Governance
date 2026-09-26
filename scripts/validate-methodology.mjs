import fs from "node:fs";
import path from "node:path";

const root=path.resolve("greenfield-portal");
const dataPath=path.join(root,"assets/data/methodology.json");
const data=JSON.parse(fs.readFileSync(dataPath,"utf8"));
const mobiliseContent=JSON.parse(fs.readFileSync(path.join(root,"assets/data/mobilise-content.json"),"utf8"));
const mobiliseSearch=JSON.parse(fs.readFileSync(path.join(root,"assets/data/mobilise-search-index.json"),"utf8"));
const discoverContent=JSON.parse(fs.readFileSync(path.join(root,"assets/data/discover-content.json"),"utf8"));
const discoverEvidence=JSON.parse(fs.readFileSync(path.join(root,"assets/data/discover-evidence-matrix.json"),"utf8"));
const discoverSearch=JSON.parse(fs.readFileSync(path.join(root,"assets/data/discover-search-index.json"),"utf8"));
const errors=[];

// The accepted production IA separates organization-wide transformation,
// individual solution delivery, and standards. See the navigation ADR.
const approvedNavigation=["Home","Get Started","Build AI Solutions","Rules & Standards","Learn","Case Studies & Demos","Templates & Reports","Tools","About"];
const approvedStages=[
  "Mobilise","Discover","Assess Readiness","Define Strategy","Establish Governance",
  "Identify and Prioritise Opportunities","Build the Business Case","Design the Target Architecture",
  "Plan Implementation","Build and Integrate","Test and Validate","Deploy and Transition",
  "Operate and Govern Production","Improve and Scale"
];

if(data.status!=="approved-baseline")errors.push("Methodology status must remain approved-baseline.");
if(data.navigation.map(item=>item.label).join("|")!==approvedNavigation.join("|"))errors.push("Approved primary navigation changed.");
if(new Set(data.navigation.map(item=>item.href)).size!==data.navigation.length)errors.push("Primary navigation contains duplicate destinations.");
if(data.navigation.find(item=>item.label==="Templates & Reports")?.href!=="/deliverables/")errors.push("Templates & Reports must resolve to the deliverables library.");
if(data.navigation.find(item=>item.label==="Tools")?.href!=="/tools/")errors.push("Tools must resolve to its distinct catalogue.");
if(data.navigation.find(item=>item.label==="Build AI Solutions")?.href!=="/lifecycle/")errors.push("Build AI Solutions must resolve to /lifecycle/.");
if(data.navigation.find(item=>item.label==="Case Studies & Demos")?.href!=="/case-studies/")errors.push("Case Studies & Demos must resolve to /case-studies/.");
if(data.stages.length!==14)errors.push(`Expected 14 lifecycle stages, found ${data.stages.length}.`);
if(data.stages.map(stage=>stage.name).join("|")!==approvedStages.join("|"))errors.push("Approved lifecycle names or sequence changed.");
if(data.stages.some((stage,index)=>stage.number!==index))errors.push("Lifecycle stage numbers are not sequential.");
if(data.stages.some(stage=>stage.status!=="available"))errors.push("All lifecycle stages must be available after first-draft completion.");

const mobilise=data.mobilise;
for(const key of ["entryCriteria","outcomes","questions","workstreams","deliverables","raci","gate","exitChecklist"]){
  if(!mobilise[key]||(Array.isArray(mobilise[key])&&!mobilise[key].length))errors.push(`Mobilise is missing ${key}.`);
}
if(mobilise.workstreams.length!==8)errors.push(`Expected 8 Mobilise workstreams, found ${mobilise.workstreams.length}.`);
if(mobilise.deliverables.length!==11)errors.push(`Expected 11 Mobilise deliverables, found ${mobilise.deliverables.length}.`);
if(mobilise.exitChecklist.length!==15)errors.push(`Expected 15 Mobilise checklist items, found ${mobilise.exitChecklist.length}.`);

if(mobiliseContent.workstreams.length!==8)errors.push(`Expected 8 complete workstream pages, found ${mobiliseContent.workstreams.length}.`);
if(mobiliseContent.deliverables.length!==20)errors.push(`Expected 20 complete deliverables, found ${mobiliseContent.deliverables.length}.`);
if(mobiliseContent.workshops.length!==6)errors.push(`Expected 6 Mobilise workshops, found ${mobiliseContent.workshops.length}.`);
if(mobiliseContent.assistants.length!==8)errors.push(`Expected 8 guided assistant actions, found ${mobiliseContent.assistants.length}.`);

const unique=(items,label)=>{
  const duplicates=items.filter((item,index)=>items.indexOf(item)!==index);
  if(duplicates.length)errors.push(`Duplicate ${label}: ${[...new Set(duplicates)].join(", ")}.`);
};
unique(mobilise.workstreams.map(item=>item.id),"workstream IDs");
unique(mobilise.deliverables.map(item=>item.id),"deliverable IDs");
unique(mobilise.exitChecklist.map(item=>item.id),"checklist IDs");

const deliverableIds=new Set(mobilise.deliverables.map(item=>item.id));
for(const id of mobilise.gate.mandatoryEvidence)if(!deliverableIds.has(id))errors.push(`Gate evidence ${id} has no deliverable.`);
for(const item of mobilise.deliverables){
  for(const field of ["id","name","type","criticality","owner","approver","purpose"])if(!item[field])errors.push(`${item.id||"Deliverable"} is missing ${field}.`);
  if(!item.acceptance?.length||!item.template?.length)errors.push(`${item.id} is missing acceptance criteria or template structure.`);
}

const completeDeliverableIds=new Set(mobiliseContent.deliverables.map(item=>item.id));
const completeDeliverableSlugs=new Set(mobiliseContent.deliverables.map(item=>item.slug));
for(const workstream of mobiliseContent.workstreams){
  for(const field of ["slug","name","summary","owner","validator","assistant"])if(!workstream[field])errors.push(`${workstream.name||"Workstream"} is missing ${field}.`);
  for(const field of ["activities","inputs","outputs","deliverables","raci","references","relatedStages"]){
    if(!workstream[field]?.length&&field!=="references")errors.push(`${workstream.name} is missing ${field}.`);
  }
  for(const slug of workstream.deliverables)if(!completeDeliverableSlugs.has(slug))errors.push(`${workstream.name} references missing deliverable ${slug}.`);
  if(workstream.raci.some(row=>row.length!==4))errors.push(`${workstream.name} has an invalid workstream RACI row.`);
}
for(const item of mobiliseContent.deliverables){
  for(const field of ["slug","id","name","type","criticality","owner","approver","purpose","why","when","ai","approval","publicSector","privateSector","template"]){
    if(!item[field])errors.push(`${item.id||"Deliverable"} is missing ${field}.`);
  }
  for(const field of ["inputs","structure","mistakes","related","success"])if(!item[field]?.length)errors.push(`${item.id} is missing ${field}.`);
  const templatePath=path.join(root,item.template.replace(/^\//,""));
  if(!fs.existsSync(templatePath))errors.push(`${item.id} template is missing: ${item.template}.`);
  for(const slug of item.related)if(!completeDeliverableSlugs.has(slug))errors.push(`${item.id} references missing related deliverable ${slug}.`);
}
for(const workshop of mobiliseContent.workshops){
  for(const field of ["slug","name","objective","duration","facilitator","assistant"])if(!workshop[field])errors.push(`${workshop.name||"Workshop"} is missing ${field}.`);
  for(const field of ["participants","preparation","questions","outputs","decisions","agenda"])if(!workshop[field]?.length)errors.push(`${workshop.name} is missing ${field}.`);
}

const expectedSearchCount=mobiliseContent.workstreams.length+mobiliseContent.deliverables.length+mobiliseContent.workshops.length+2;
if(mobiliseSearch.records.length!==expectedSearchCount)errors.push(`Mobilise search contains ${mobiliseSearch.records.length} records; expected ${expectedSearchCount}.`);
const indexedHrefs=new Set(mobiliseSearch.records.map(item=>item.href));
if(indexedHrefs.size!==mobiliseSearch.records.length)errors.push("Mobilise search contains duplicate canonical routes.");
for(const record of mobiliseSearch.records){
  const routePath=record.href.endsWith("/")?`${record.href}index.html`:record.href;
  if(!fs.existsSync(path.join(root,routePath.replace(/^\//,""))))errors.push(`Search route does not resolve: ${record.href}.`);
}

const raci=mobilise.raci;
for(const row of raci.activities){
  if(row.assignments.length!==raci.roles.length)errors.push(`RACI width mismatch for ${row.activity}.`);
  const accountable=row.assignments.filter(value=>value.includes("A")).length;
  if(accountable!==1)errors.push(`${row.activity} has ${accountable} accountable roles; expected exactly one.`);
  if(!row.assignments.some(value=>value.includes("R")))errors.push(`${row.activity} has no responsible role.`);
}

if(discoverContent.domains.length!==20)errors.push(`Expected 20 Discover domains, found ${discoverContent.domains.length}.`);
if(discoverContent.deliverables.length!==22)errors.push(`Expected 22 Discover deliverables, found ${discoverContent.deliverables.length}.`);
if(discoverContent.workshops.length!==10)errors.push(`Expected 10 Discover workshops, found ${discoverContent.workshops.length}.`);
if(discoverContent.assistants.length!==9)errors.push(`Expected 9 Discover assistants, found ${discoverContent.assistants.length}.`);
if(discoverContent.exitChecklist.length!==23)errors.push(`Expected 23 Discover checklist items, found ${discoverContent.exitChecklist.length}.`);
if(discoverContent.evidence.length!==164||discoverEvidence.records.length!==164)errors.push("Discover evidence model must contain 164 canonical records.");
if(discoverSearch.records.length!==55)errors.push(`Expected 55 Discover search records, found ${discoverSearch.records.length}.`);
const discoverDomainSlugs=new Set(discoverContent.domains.map(item=>item.slug));
const discoverDeliverableSlugs=new Set(discoverContent.deliverables.map(item=>item.slug));
const discoverDeliverableIds=new Set(discoverContent.deliverables.map(item=>item.id));
unique([...discoverDomainSlugs],"Discover domain slugs");
unique([...discoverDeliverableSlugs],"Discover deliverable slugs");
for(const domain of discoverContent.domains){
  for(const field of ["slug","name","summary","owner","assistant","publicSector","privateSector"])if(!domain[field])errors.push(`${domain.name||"Discover domain"} is missing ${field}.`);
  for(const field of ["objectives","information","evidenceSources","validation","risks","examples","contributors","deliverables","knowledge","relatedStages"])if(!domain[field]?.length)errors.push(`${domain.name} is missing ${field}.`);
  for(const slug of domain.deliverables)if(!discoverDeliverableSlugs.has(slug))errors.push(`${domain.name} references missing Discover deliverable ${slug}.`);
}
for(const item of discoverContent.deliverables){
  for(const field of ["slug","id","name","type","owner","approver","purpose","value","timing","approval","assistant","template"])if(!item[field])errors.push(`${item.id||"Discover deliverable"} is missing ${field}.`);
  for(const field of ["workstreams","inputs","outputs","structure","mistakes"])if(!item[field]?.length)errors.push(`${item.id} is missing ${field}.`);
  for(const slug of item.workstreams)if(!discoverDomainSlugs.has(slug))errors.push(`${item.id} references missing Discover domain ${slug}.`);
  if(!fs.existsSync(path.join(root,item.template.replace(/^\//,""))))errors.push(`${item.id} template is missing: ${item.template}.`);
}
for(const workshop of discoverContent.workshops){
  for(const field of ["slug","name","objective","duration","facilitator","assistant"])if(!workshop[field])errors.push(`${workshop.name||"Discover workshop"} is missing ${field}.`);
  for(const field of ["participants","preparation","agenda","questions","outputs","decisions"])if(!workshop[field]?.length)errors.push(`${workshop.name} is missing ${field}.`);
}
const evidenceFields=["id","domain","information","purpose","source","systemOfRecord","businessOwner","technicalOwner","validationMethod","evidenceType","confidence","frequency","usedBy"];
for(const record of discoverEvidence.records){
  for(const field of evidenceFields)if(!record[field]||(Array.isArray(record[field])&&!record[field].length))errors.push(`${record.id||"Evidence record"} is missing ${field}.`);
  if(!discoverDomainSlugs.has(record.domain))errors.push(`${record.id} references missing Discover domain ${record.domain}.`);
}
const discoverIndexedHrefs=new Set(discoverSearch.records.map(item=>item.href));
if(discoverIndexedHrefs.size!==discoverSearch.records.length)errors.push("Discover search contains duplicate canonical routes.");
for(const record of discoverSearch.records){
  const routePath=record.href.endsWith("/")?`${record.href}index.html`:record.href;
  if(!fs.existsSync(path.join(root,routePath.replace(/^\//,""))))errors.push(`Discover search route does not resolve: ${record.href}.`);
}
for(const row of discoverContent.raci.activities){
  if(row.assignments.length!==discoverContent.raci.roles.length)errors.push(`Discover RACI width mismatch for ${row.activity}.`);
  if(row.assignments.filter(value=>value.includes("A")).length!==1)errors.push(`${row.activity} must have exactly one accountable role.`);
  if(!row.assignments.some(value=>value.includes("R")))errors.push(`${row.activity} has no responsible role.`);
}
for(const id of discoverContent.gate.mandatoryEvidence)if(!discoverDeliverableIds.has(id))errors.push(`Discover gate evidence ${id} has no deliverable.`);
if(discoverContent.gate.mandatoryEvidence.length!==22)errors.push("Discover gate must require all 22 deliverables.");
const approvedTraceability=["Business Capability","Business Process","Application","Technology","Data","Risk","AI Opportunity","Future Strategy"];
if(discoverContent.traceability.sequence.join("|")!==approvedTraceability.join("|"))errors.push("Discover traceability sequence changed.");

for(const relative of ["transformation/index.html","transformation/stage-0-mobilise/index.html","assets/js/methodology.js","assets/css/methodology.css"]){
  if(!fs.existsSync(path.join(root,relative)))errors.push(`Missing implementation file ${relative}.`);
}

console.log(`Validated methodology ${data.version}: ${data.stages.length} stages; Mobilise ${mobiliseContent.workstreams.length} workstreams/${mobiliseContent.deliverables.length} deliverables; Discover ${discoverContent.domains.length} domains/${discoverContent.deliverables.length} deliverables/${discoverEvidence.records.length} evidence records/${discoverContent.workshops.length} workshops.`);
if(errors.length){
  for(const error of errors)console.error(`ERROR ${error}`);
  process.exitCode=1;
}else{
  console.log("Accepted production navigation, the 14-stage transformation model, and Mobilise/Discover traceability, evidence and accountability checks passed.");
}
