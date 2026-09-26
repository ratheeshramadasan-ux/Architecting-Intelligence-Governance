import fs from "node:fs";
import path from "node:path";
const root=path.resolve("greenfield-portal");
const framework=JSON.parse(fs.readFileSync(path.join(root,"assets/data/assessment-framework.json"),"utf8"));
const search=JSON.parse(fs.readFileSync(path.join(root,"assets/data/platform-search-index.json"),"utf8"));
const methodology=JSON.parse(fs.readFileSync(path.join(root,"assets/data/methodology.json"),"utf8"));
const errors=[];
const maturity=["Initial","Developing","Managed","Optimised","Enterprise Leading"];
const traceability=["Discovery Evidence","Readiness","Strategy","Governance","Architecture","Business Case","Implementation","Operations"];
const required=["id","slug","name","type","topic","industry","owner","primaryStage","deliverable","purpose","value","scoring"];
const arrays=["objectives","scope","questions","evidence","risk","recommendations","relatedStages","relatedDeliverables","roles","prompts"];
if(framework.assessments.length!==24)errors.push(`Expected 24 assessments, found ${framework.assessments.length}.`);
if(framework.prompts.length!==7)errors.push(`Expected 7 prompt builders, found ${framework.prompts.length}.`);
if(framework.maturity.map(x=>x.name).join("|")!==maturity.join("|"))errors.push("Shared maturity model changed.");
if(framework.traceability.join("|")!==traceability.join("|"))errors.push("Assessment traceability changed.");
const slugs=new Set(),ids=new Set();
for(const item of framework.assessments){
  for(const field of required)if(!item[field])errors.push(`${item.id||item.name||"Assessment"} is missing ${field}.`);
  for(const field of arrays)if(!item[field]?.length)errors.push(`${item.id} is missing ${field}.`);
  if(item.questions.length<8)errors.push(`${item.id} has insufficient assessment questions.`);
  if(slugs.has(item.slug))errors.push(`Duplicate assessment slug ${item.slug}.`);slugs.add(item.slug);
  if(ids.has(item.id))errors.push(`Duplicate assessment ID ${item.id}.`);ids.add(item.id);
  if(!methodology.stages.some(x=>x.name===item.primaryStage))errors.push(`${item.id} references an unknown lifecycle stage.`);
  if(item.prompts.some(id=>!framework.prompts.some(x=>x.id===id)))errors.push(`${item.id} references an unknown prompt builder.`);
  if(!fs.existsSync(path.join(root,"assessments",item.slug,"index.html")))errors.push(`${item.id} route is missing.`);
}
const assessmentSearch=search.records.filter(x=>x.type==="Assessment");
if(assessmentSearch.length!==24)errors.push(`Platform search indexes ${assessmentSearch.length} assessments; expected 24.`);
for(const item of framework.assessments)if(!assessmentSearch.some(x=>x.href===`/assessments/${item.slug}/`))errors.push(`${item.id} is missing from platform search.`);
for(const relative of ["assessments/index.html","assessments/library/index.html","assessments/dashboard/index.html","assets/js/assessment-platform.js","assets/js/assessment-library.js","assets/js/assessment-dashboard.js","assets/js/assessment-detail.js","assets/js/home-platform.js","assets/css/home-platform.css"]){
  if(!fs.existsSync(path.join(root,relative)))errors.push(`Missing assessment platform file ${relative}.`);
}
const homepage=fs.readFileSync(path.join(root,"index.html"),"utf8");
for(const text of ["Architecting Intelligence","Explore the journey","Explore deliverables","Search the platform","Key deliverables","The journey","Who it’s for","About the author"]){
  if(!homepage.toLowerCase().includes(text.toLowerCase()))errors.push(`Homepage is missing required content: ${text}.`);
}
if(!homepage.includes('id="home-search-form"'))errors.push("Homepage global search is missing.");
if(!homepage.includes('id="home-search-dialog"'))errors.push("Homepage search dialog is missing.");
console.log(`Validated assessment platform: ${framework.assessments.length} assessments, ${framework.prompts.length} prompt builders, ${framework.maturity.length} maturity levels and ${search.records.length} global search records.`);
if(errors.length){for(const error of errors)console.error(`ERROR ${error}`);process.exitCode=1}else console.log("Assessment structure, traceability, search integration and homepage requirements passed.");
