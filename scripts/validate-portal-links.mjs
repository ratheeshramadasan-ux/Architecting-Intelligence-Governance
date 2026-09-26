import fs from "node:fs";
import path from "node:path";
const root=path.resolve("greenfield-portal");
const transformationPages=fs.existsSync(path.join(root,"transformation"))
  ? fs.readdirSync(path.join(root,"transformation"),{recursive:true,withFileTypes:true})
    .filter(entry=>entry.isFile()&&entry.name.endsWith(".html"))
    .map(entry=>path.relative(root,path.join(entry.parentPath,entry.name)).replaceAll("\\","/"))
  : [];
const assessmentPages=fs.existsSync(path.join(root,"assessments"))
  ? fs.readdirSync(path.join(root,"assessments"),{recursive:true,withFileTypes:true})
    .filter(entry=>entry.isFile()&&entry.name.endsWith(".html"))
    .map(entry=>path.relative(root,path.join(entry.parentPath,entry.name)).replaceAll("\\","/"))
  : [];
const production=["index.html","admin.html","login.html","register.html","journey/index.html","deliverables/index.html","tools/index.html",...fs.readdirSync(path.join(root,"pages")).filter(name=>name.endsWith(".html")&&!name.includes("_test")).map(name=>`pages/${name}`),...transformationPages,...assessmentPages];
const errors=[],warnings=[];
for(const relative of production){
  const file=path.join(root,relative),html=fs.readFileSync(file,"utf8");
  const ids=[...html.matchAll(/\sid=["']([^"']+)["']/gi)].map(match=>match[1]);
  const duplicates=ids.filter((id,index)=>ids.indexOf(id)!==index);
  if(duplicates.length)errors.push(`${relative}: duplicate IDs ${[...new Set(duplicates)].join(", ")}`);
  if(!/<title>[^<]+<\/title>/i.test(html))errors.push(`${relative}: missing title`);
  if(!/<meta\s+name=["']description["']/i.test(html))warnings.push(`${relative}: missing meta description`);
  if(!/<h1(?:\s|>)/i.test(html))errors.push(`${relative}: missing h1`);
  for(const image of html.matchAll(/<img\b[^>]*>/gi))if(!/\salt=["'][^"']*["']/i.test(image[0]))errors.push(`${relative}: image missing alt`);
  for(const link of html.matchAll(/\b(?:href|src)=["']([^"'?#]+)(?:[?#][^"']*)?["']/gi)){
    const target=link[1];
    if(/^(?:https?:|mailto:|tel:|data:|#)/i.test(target)||target.startsWith("/api/"))continue;
    let resolved=target==="/"?path.join(root,"index.html"):target.startsWith("/")?path.join(root,target.slice(1)):path.resolve(path.dirname(file),target);
    if(!path.extname(resolved)){if(fs.existsSync(`${resolved}.html`))resolved=`${resolved}.html`;else if(fs.existsSync(path.join(resolved,"index.html")))resolved=path.join(resolved,"index.html")}
    if(!fs.existsSync(resolved))errors.push(`${relative}: unresolved local target ${target}`);
  }
}
console.log(`Validated ${production.length} production HTML pages.`);
for(const warning of warnings)console.warn(`WARN ${warning}`);
for(const error of errors)console.error(`ERROR ${error}`);
if(errors.length)process.exitCode=1;else console.log("No broken local targets, duplicate IDs, missing H1 headings, or missing image alt attributes.");
