import fs from "node:fs";
import path from "node:path";

const root=path.resolve("greenfield-portal");
const ignored=new Set(["index.html.bak","temp_body.html","withHero.html","withStyle.html","solutions_test.html"]);
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
  const full=path.join(dir,entry.name);
  if(entry.isDirectory()&&["index_files","downloads","work"].includes(entry.name))return[];
  return entry.isDirectory()?walk(full):entry.isFile()&&entry.name.endsWith(".html")&&!ignored.has(entry.name)?[full]:[];
});
const pages=walk(root),methodology=JSON.parse(fs.readFileSync(path.join(root,"assets/data/methodology.json"),"utf8"));
const dynamicStageIds=new Set(["overview","questions","workspaces","evidence","decisions","governance","criteria","guidance"]);
const records=[],errors=[],wrongDestinations=[];
const clean=value=>value.replace(/<[^>]+>/g," ").replace(/&(?:nbsp|middot|rarr|mdash);/g," ").replace(/\s+/g," ").trim();
const resolveTarget=(source,href)=>{
  const [routeWithQuery,fragment=""]=href.split("#"),route=routeWithQuery.split("?")[0];
  let target=route?route.startsWith("/")?path.join(root,route.slice(1)):path.resolve(path.dirname(source),route):source;
  if(!path.extname(target)){if(fs.existsSync(`${target}.html`))target=`${target}.html`;else target=path.join(target,"index.html")}
  return{target,fragment};
};
for(const source of pages){
  const html=fs.readFileSync(source,"utf8"),relative=path.relative(root,source).replaceAll("\\","/");
  for(const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
    const href=match[1],label=clean(match[2]);
    if(/^(?:https?:|mailto:|tel:|data:|javascript:|\/api\/)/i.test(href))continue;
    const normalisedHref=href.startsWith("?")?`${path.basename(source)}${href}`:href;
    const {target,fragment}=resolveTarget(source,normalisedHref),exists=fs.existsSync(target);
    let anchor=true;
    if(exists&&fragment){
      const targetHtml=fs.readFileSync(target,"utf8");
      anchor=new RegExp(`\\bid=["']${fragment.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}["']`,"i").test(targetHtml);
      if(!anchor&&/transformation\/stage-(?:[3-9]|1[0-3])-/.test(target.replaceAll("\\","/")))anchor=dynamicStageIds.has(fragment);
    }
    const record={source:relative,label,href,resolved:path.relative(root,target).replaceAll("\\","/"),status:exists&&anchor?"ok":!exists?"missing-route":"missing-anchor",redirect:null};
    records.push(record);if(record.status!=="ok")errors.push(record);
  }
}
for(const stage of methodology.stages){
  const expected=`/transformation/${stage.slug}/`;
  if(stage.href!==expected)wrongDestinations.push({stage:stage.number,label:stage.name,expected,actual:stage.href});
  const target=path.join(root,expected.slice(1),"index.html");
  if(!fs.existsSync(target))errors.push({source:"assets/data/methodology.json",label:stage.name,href:expected,resolved:path.relative(root,target),status:"missing-route",redirect:null});
}
const report={generatedAt:new Date().toISOString(),pagesChecked:pages.length,internalLinksChecked:records.length,brokenLinks:errors.filter(x=>x.status==="missing-route").length,missingAnchors:errors.filter(x=>x.status==="missing-anchor").length,wrongDestinations:wrongDestinations.length,redirects:0,errors,wrongDestinationDetails:wrongDestinations};
fs.mkdirSync(path.resolve("tmp"),{recursive:true});
fs.writeFileSync(path.resolve("tmp/internal-link-audit.json"),JSON.stringify(report,null,2));
console.log(`Internal link audit: ${report.pagesChecked} pages; ${report.internalLinksChecked} links; ${report.brokenLinks} broken; ${report.missingAnchors} missing anchors; ${report.wrongDestinations} wrong stage destinations; ${report.redirects} redirects.`);
if(errors.length||wrongDestinations.length){for(const item of [...errors,...wrongDestinations])console.error(JSON.stringify(item));process.exitCode=1}
