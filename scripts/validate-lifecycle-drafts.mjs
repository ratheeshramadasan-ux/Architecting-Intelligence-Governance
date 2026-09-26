import fs from "node:fs";
import path from "node:path";

const root=path.resolve("greenfield-portal");
const methodology=JSON.parse(fs.readFileSync(path.join(root,"assets/data/methodology.json"),"utf8"));
const drafts=JSON.parse(fs.readFileSync(path.join(root,"assets/data/lifecycle-stage-content.json"),"utf8"));
const errors=[],requiredArrays=["questions","workspaces","activities","inputs","roles","deliverables","governance","risks","dependencies","measures","entry","exit","configuration"];
if(methodology.stages.length!==14)errors.push(`Expected 14 stages; found ${methodology.stages.length}.`);
if(methodology.stages.at(-1)?.ordinal!==14||methodology.stages.at(-1)?.name!=="Improve and Scale")errors.push("Lifecycle position 14 is not explicitly mapped to Improve and Scale.");
for(const meta of methodology.stages){
  const file=path.join(root,"transformation",meta.slug,"index.html");
  if(!fs.existsSync(file)){errors.push(`Missing stage route ${meta.href}`);continue}
  const html=fs.readFileSync(file,"utf8");
  if(!html.includes("/assets/js/methodology-v10.js"))errors.push(`${meta.slug} does not import the shared page-menu runtime.`);
  if(meta.number>=3&&!html.includes("/assets/js/lifecycle-stage.js"))errors.push(`${meta.slug} does not import the shared lifecycle renderer.`);
}
const uniqueFields=["why","separation","prevents","guidance"];
for(const stage of drafts.stages){
  for(const field of uniqueFields)if(!stage[field]||stage[field].length<45)errors.push(`${stage.slug} has insufficient ${field} content.`);
  for(const field of requiredArrays)if(!Array.isArray(stage[field])||stage[field].length<3)errors.push(`${stage.slug} has insufficient ${field} content.`);
  const serialised=JSON.stringify(stage);
  if(/\b(?:TBD|Lorem ipsum|Add later|Coming soon|Placeholder)\b/i.test(serialised))errors.push(`${stage.slug} contains an unfinished marker.`);
}
for(const field of uniqueFields){
  const values=drafts.stages.map(stage=>stage[field]);
  if(new Set(values).size!==values.length)errors.push(`Duplicate ${field} content detected.`);
}
console.log(`Lifecycle draft validation: ${methodology.stages.length} routes; ${drafts.stages.length} configuration-driven drafts; lifecycle position 14 is ${methodology.stages.at(-1).name}; ${errors.length} errors.`);
for(const error of errors)console.error(`ERROR ${error}`);
if(errors.length)process.exitCode=1;
