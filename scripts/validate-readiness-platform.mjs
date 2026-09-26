import fs from "node:fs";
import path from "node:path";
const root=path.resolve("greenfield-portal"),data=JSON.parse(fs.readFileSync(path.join(root,"assets/data/readiness-content.json"),"utf8")),search=JSON.parse(fs.readFileSync(path.join(root,"assets/data/platform-search-index.json"),"utf8")),errors=[];
const exact=(actual,expected,label)=>{if(actual.join("|")!==expected.join("|"))errors.push(`${label} changed.`)};
if(data.workspaces.length!==10)errors.push(`Expected 10 readiness workspaces, found ${data.workspaces.length}.`);
if(data.deliverables.length!==17)errors.push(`Expected 17 executive deliverables, found ${data.deliverables.length}.`);
if(data.visualisations.length!==7)errors.push(`Expected 7 visualisations, found ${data.visualisations.length}.`);
if(data.prompts.length!==8)errors.push(`Expected 8 readiness prompt builders, found ${data.prompts.length}.`);
if(data.decisions.length!==4)errors.push(`Expected 4 executive outcomes, found ${data.decisions.length}.`);
exact(data.traceability,["Discovery Evidence","Assessment","Gap","Recommendation","Roadmap","Strategy"],"Readiness traceability");
exact(data.decisions.map(x=>x.name),["Proceed","Proceed with Conditions","Delay","Do Not Proceed"],"Executive decision framework");
exact(data.gapModel.fields,["Current State","Target State","Business Impact","Risk","Priority","Estimated Effort","Dependencies","Owner","Target Resolution Stage","Related Capability","Related Deliverables","Recommendation"],"Gap model");
const workspaceFields=["id","slug","name","owner","summary","executiveSummary","aiGuidance"],workspaceArrays=["objectives","readinessCriteria","evidenceConsumed","assessmentResults","gapAnalysis","risks","dependencies","recommendations","relatedAssessments","relatedDeliverables","relatedTemplates"];
for(const item of data.workspaces){
  for(const field of workspaceFields)if(!item[field])errors.push(`${item.id||"Workspace"} is missing ${field}.`);
  for(const field of workspaceArrays)if(!item[field]?.length)errors.push(`${item.id} is missing ${field}.`);
  if(!fs.existsSync(path.join(root,"transformation/stage-2-assess-readiness/workspaces",item.slug,"index.html")))errors.push(`${item.id} route is missing.`);
}
const deliverableFields=["id","slug","name","type","owner","approval","purpose","value","template"],deliverableArrays=["inputs","outputs","relatedAssessments","relatedEvidence","relatedStages","structure"];
for(const item of data.deliverables){
  for(const field of deliverableFields)if(!item[field])errors.push(`${item.id||"Deliverable"} is missing ${field}.`);
  for(const field of deliverableArrays)if(!item[field]?.length)errors.push(`${item.id} is missing ${field}.`);
  if(!fs.existsSync(path.join(root,"transformation/stage-2-assess-readiness/deliverables",item.slug,"index.html")))errors.push(`${item.id} route is missing.`);
  if(!fs.existsSync(path.join(root,item.template.replace(/^\//,""))))errors.push(`${item.id} template is missing.`);
}
const readinessSearch=search.records.filter(x=>["Readiness workspace","Readiness deliverable","Readiness visualisation","Decision framework","AI prompt builder"].includes(x.type)||x.title==="Assess Readiness");
const expectedSearch=1+data.workspaces.length+data.deliverables.length+data.visualisations.length+data.decisions.length+data.prompts.length;
if(readinessSearch.length!==expectedSearch)errors.push(`Readiness search has ${readinessSearch.length} records; expected ${expectedSearch}.`);
for(const record of readinessSearch){const route=record.href.split("#")[0],target=route.endsWith("/")?`${route}index.html`:route;if(!fs.existsSync(path.join(root,target.replace(/^\//,""))))errors.push(`Readiness search route does not resolve: ${record.href}.`)}
const queryTerms=["are we ready","gap analysis","executive summary","roadmap","recommendations","heat map","decision framework"];
const readinessText=JSON.stringify(readinessSearch).toLowerCase();
for(const term of queryTerms)if(!readinessText.includes(term))errors.push(`Readiness search intent is missing: ${term}.`);
for(const route of ["enterprise","programme","architecture","operations"])if(!fs.existsSync(path.join(root,`transformation/stage-2-assess-readiness/dashboards/${route}/index.html`)))errors.push(`${route} readiness dashboard is missing.`);
const homeJs=fs.readFileSync(path.join(root,"assets/js/home-platform.js"),"utf8");
for(const text of ["platform-search-index.json","/api/showcase","renderTimeline","renderEvidence","wireSearch"])if(!homeJs.includes(text))errors.push(`Homepage integration is missing ${text}.`);
console.log(`Validated Assess Readiness: ${data.workspaces.length} workspaces, ${data.deliverables.length} deliverables, ${data.visualisations.length} visualisations, ${data.prompts.length} prompt builders and ${readinessSearch.length} search records.`);
if(errors.length){for(const error of errors)console.error(`ERROR ${error}`);process.exitCode=1}else console.log("Gap, prioritisation, decision, traceability, route, search and homepage integration checks passed.");
